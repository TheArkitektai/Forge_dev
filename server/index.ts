import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import * as zlib from "zlib";
import { promisify } from "util";
import { nanoid } from "nanoid";

const deflateRaw = promisify(zlib.deflateRaw);

// ── In-memory session store ───────────────────────────────────────────────────
type AuthUser = { id: string; name: string; email: string; roleId: string; organizationId: string };
const sessions = new Map<string, AuthUser>();

const DEMO_USERS: Array<AuthUser & { password: string }> = [
  { id: "u1", email: "admin@uxbert.test", password: "admin123", name: "Admin User", roleId: "admin", organizationId: "org-uxbert" },
  { id: "u2", email: "farrukh@thearkitekt.ai", password: "admin123", name: "Farrukh", roleId: "admin", organizationId: "org-arkitekt" },
];

const parseCookie = (req: express.Request, name: string): string | undefined => {
  const raw = req.headers.cookie ?? "";
  for (const part of raw.split(";")) {
    const [k, v] = part.trim().split("=");
    if (k === name) return v;
  }
  return undefined;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Content extractors ────────────────────────────────────────────────────────

/** Strip markdown code fences and find the JSON object or array anywhere in text */
function extractJSON(text: string): string {
  // Strip code fences
  let s = text.replace(/^```(?:json)?\s*/im, "").replace(/\s*```\s*$/im, "").trim();
  // If it already starts with { or [, try to use it directly
  if (s.startsWith("{") || s.startsWith("[")) return s;
  // Find the outermost { ... } block
  const start = s.indexOf("{");
  if (start !== -1) {
    let depth = 0;
    for (let i = start; i < s.length; i++) {
      if (s[i] === "{") depth++;
      else if (s[i] === "}") { depth--; if (depth === 0) return s.slice(start, i + 1); }
    }
  }
  return s;
}

/** Strip code fences and ensure PlantUML content has @startuml/@enduml wrapper */
function extractPlantUML(text: string): string {
  let s = text.replace(/^```(?:plantuml)?\s*/im, "").replace(/\s*```\s*$/im, "").trim();
  // Strip external URL imports — PlantUML server can't fetch them and returns 400
  s = s.split("\n").filter(line => {
    const t = line.trim();
    return !(t.startsWith("!include ") && (t.includes("http") || t.includes("github")))
        && !(t.startsWith("!define ") && (t.includes("http") || t.includes("github")));
  }).join("\n");
  if (!s.includes("@startuml")) s = "@startuml\n" + s;
  if (!s.includes("@enduml")) s = s + "\n@enduml";
  return s;
}

const PLANTUML_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

function encodePlantUMLChunk(b1: number, b2: number, b3: number): string {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3F;
  return PLANTUML_CHARS[c1] + PLANTUML_CHARS[c2] + PLANTUML_CHARS[c3] + PLANTUML_CHARS[c4];
}

async function encodePlantUML(source: string): Promise<string> {
  const compressed = await deflateRaw(Buffer.from(source, "utf-8"));
  const bytes = Array.from(compressed);
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    result += encodePlantUMLChunk(bytes[i] ?? 0, bytes[i + 1] ?? 0, bytes[i + 2] ?? 0);
  }
  return result;
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // ── Auth endpoints ────────────────────────────────────────────────────────
  app.post("/api/v1/auth/login", (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    const match = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!match) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const token = nanoid(32);
    const { password: _, ...user } = match;
    sessions.set(token, user);
    res.setHeader("Set-Cookie", `forge_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`);
    res.json({ user });
  });

  app.get("/api/v1/auth/me", (req, res) => {
    const token = parseCookie(req, "forge_session");
    const user = token ? sessions.get(token) : undefined;
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    res.json({ user });
  });

  app.post("/api/v1/auth/logout", (req, res) => {
    const token = parseCookie(req, "forge_session");
    if (token) sessions.delete(token);
    res.setHeader("Set-Cookie", "forge_session=; Path=/; HttpOnly; Max-Age=0");
    res.json({ ok: true });
  });

  // Story breakdown endpoint — calls Claude to generate structured story analysis
  app.post("/api/story/breakdown", async (req, res) => {
    const { title, summary, owner, risk } = req.body as {
      title: string;
      summary?: string;
      owner?: string;
      risk?: string;
    };

    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(503).json({ error: "ANTHROPIC_API_KEY not configured" });
      return;
    }

    try {
      const prompt = `You are the Planning Agent inside Arkitekt Forge, an AI-governed software delivery platform.

A new story has been created:
Title: ${title}
Summary: ${summary || "No summary provided"}
Owner: ${owner || "Unassigned"}
Risk Level: ${risk || "Medium"}

Generate a structured analysis for this story. Return ONLY valid JSON matching this exact schema:

{
  "description": "2-3 clear sentences explaining what this story delivers and why it matters",
  "acceptanceCriteria": [
    { "id": "ac-1", "text": "specific, testable criterion", "met": false },
    { "id": "ac-2", "text": "specific, testable criterion", "met": false },
    { "id": "ac-3", "text": "specific, testable criterion", "met": false },
    { "id": "ac-4", "text": "specific, testable criterion", "met": false },
    { "id": "ac-5", "text": "specific, testable criterion", "met": false }
  ],
  "agentOutputs": {
    "Plan": {
      "sections": [
        {
          "title": "Brief Document",
          "type": "brief",
          "content": "Problem statement and scope in 2-3 sentences",
          "items": ["Success metric 1", "Success metric 2", "Success metric 3"],
          "status": "awaiting_review",
          "agentName": "Planning Agent"
        },
        {
          "title": "Architecture Impact",
          "type": "architecture_impact",
          "content": "Which platform layers are affected and how",
          "items": ["Layer impact 1", "Layer impact 2", "Layer impact 3"],
          "status": "awaiting_review",
          "agentName": "Planning Agent"
        }
      ]
    }
  }
}

Rules:
- All acceptance criteria must be specific and testable, not vague
- Do not use dashes in any text, use colons or commas instead
- Keep content concise and professional
- Return only the JSON object, no markdown, no code fences`;

      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const raw = message.content[0].type === "text" ? message.content[0].text : "";
      // Strip markdown code fences if Claude wraps the response
      const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
      const parsed = JSON.parse(clean);
      res.json({ ...parsed, tokensUsed: message.usage.input_tokens + message.usage.output_tokens });
    } catch (err) {
      console.error("Story breakdown error:", err);
      res.status(500).json({ error: "Agent failed to generate breakdown" });
    }
  });

  // Phase advance endpoint — Context Compiler + phase-specific agent
  // Receives compressed context from previous phases (NOT raw history)
  // This is the token efficiency moat: each agent gets a tight brief, not full history
  app.post("/api/story/advance", async (req, res) => {
    const { title, toPhase, compiledContext } = req.body as {
      title: string;
      toPhase: string;
      compiledContext: {
        description: string;
        phases: Record<string, string>; // phase -> compressed 200-char summary
        memoryPatterns?: string[];
      };
    };

    if (!title || !toPhase) {
      res.status(400).json({ error: "title and toPhase required" });
      return;
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(503).json({ error: "ANTHROPIC_API_KEY not configured" });
      return;
    }

    const agentNames: Record<string, string> = {
      Design: "Design Agent",
      Develop: "Development Agent",
      Test: "QA Agent",
      Ship: "Release Agent",
    };

    const phaseInstructions: Record<string, string> = {
      Design: `Generate exactly 4 sections. For sections 1 to 3, the "content" field must contain ONLY raw Mermaid diagram syntax — no introduction text, no backticks, no code fences, no explanation. Start the content value directly with the Mermaid keyword.

Section 1: title "User Flow", type "design_flow". content must start with "graph TD" followed by newline-separated nodes and edges showing the user journey through this feature. Include 6 to 10 nodes. Use --> for edges and label them. items = [].
Section 2: title "Sequence Diagram", type "component_diagram". content must start with "sequenceDiagram" followed by actor declarations and ->> message arrows showing how the system components interact. Include at least 5 messages. items = [].
Section 3: title "Component Architecture", type "architecture_impact". content must start with "graph LR" followed by nodes and edges showing frontend, backend, and data layer components and their relationships. Include 6 to 10 nodes. items = ["affected layer: impact description", ...].
Section 4: title "Compliance Mapping", type "security_scan". content = plain text summary of regulatory and security requirements this design satisfies. items = ["Requirement name: how this design satisfies it", ...] with 3 to 5 items.`,

      Develop: `Generate 2 sections:
1. Code Summary (type: "code_summary"): files and modules to implement. content = implementation approach. items = ["filename.ts: purpose", ...].
2. Test Plan (type: "test_results"): test coverage plan. content = testing strategy. items = ["Test: what it verifies", ...].`,

      Test: `Generate 2 sections:
1. Test Results (type: "test_results"): test suite outcomes. content = overall result summary. items = ["PASS TestName: what passed", "FAIL TestName: what failed (if any)", ...].
2. Security Scan (type: "security_scan"): security review findings. content = scan summary. items = ["Check: result", ...].`,

      Ship: `Generate 2 sections:
1. Deploy Checklist (type: "deploy_checklist"): production deployment steps. content = deployment overview. items = ["Step: action", ...] (6-8 items).
2. Release Notes (type: "release_notes"): auto-generated release notes. content = full release notes text. items = ["Feature: description", ...].`,
    };

    const agentName = agentNames[toPhase] ?? "Agent";
    const instructions = phaseInstructions[toPhase];

    if (!instructions) {
      res.status(400).json({ error: `No agent defined for phase: ${toPhase}` });
      return;
    }

    // Build compiled context string — this is the token efficiency moat
    // Previous agents' outputs are compressed to ~200 chars each, not sent in full
    const contextLines = Object.entries(compiledContext.phases)
      .map(([phase, summary]) => `${phase} Phase Summary: ${summary}`)
      .join("\n");

    const memoryLine = compiledContext.memoryPatterns?.length
      ? `\nRelevant Memory Patterns:\n${compiledContext.memoryPatterns.map(p => `- ${p}`).join("\n")}`
      : "";

    const prompt = `You are the ${agentName} inside Arkitekt Forge, an AI-governed software delivery platform.

STORY: ${title}
DESCRIPTION: ${compiledContext.description || "No description provided"}

COMPILED CONTEXT FROM PREVIOUS AGENTS (compressed, not full history):
${contextLines || "No prior phases"}${memoryLine}

Your task: Generate the ${toPhase} phase agent output for this story.
${instructions}

Return ONLY a valid JSON object. No markdown. No code fences. No text before or after the JSON.

The JSON must match this exact structure:
{
  "${toPhase}": {
    "sections": [
      {
        "title": "Section title",
        "type": "design_flow",
        "content": "graph TD\n  A[User] --> B[Step]\n  B --> C[End]",
        "items": [],
        "status": "awaiting_review",
        "agentName": "${agentName}"
      }
    ]
  },
  "contextSummary": "one sentence summary under 150 characters"
}

CRITICAL: For diagram sections the content value must be raw Mermaid syntax only. No text before the diagram keyword. No backticks. No code fences. The content string must start directly with graph, sequenceDiagram, or erDiagram. Use \\n for newlines inside the content string.`;

    try {
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2500,
        messages: [{ role: "user", content: prompt }],
      });

      const raw = message.content[0].type === "text" ? message.content[0].text : "";
      const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
      const parsed = JSON.parse(clean);

      res.json({
        agentOutputs: { [toPhase]: parsed[toPhase] },
        contextSummary: parsed.contextSummary ?? "",
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
        agentName,
      });
    } catch (err) {
      console.error("Story advance error:", err);
      res.status(500).json({ error: "Agent failed to generate phase output" });
    }
  });

  // ── Document extraction endpoint (BRD import) ───────────────────────────
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  app.post("/api/story/extract-from-document", upload.single("file"), async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(503).json({ error: "ANTHROPIC_API_KEY not configured" });
      return;
    }

    let text = "";
    try {
      const mime = req.file.mimetype;
      if (mime === "application/pdf") {
        const parser = new PDFParse({ data: req.file.buffer });
        const result = await parser.getText();
        text = result.text;
      } else if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = result.value;
      } else if (mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        const wb = XLSX.read(req.file.buffer, { type: "buffer" });
        text = wb.SheetNames.map(name => {
          const ws = wb.Sheets[name];
          return XLSX.utils.sheet_to_csv(ws);
        }).join("\n\n");
      } else if (mime === "text/csv") {
        text = req.file.buffer.toString("utf-8");
      } else {
        res.status(400).json({ error: "Unsupported file type" });
        return;
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to extract text from document" });
      return;
    }

    const CHUNK_SIZE = 6000;
    const MAX_CHUNKS = 5;
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      chunks.push(words.slice(i, i + CHUNK_SIZE).join(" "));
    }
    const truncated = chunks.length > MAX_CHUNKS;
    const chunksToProcess = chunks.slice(0, MAX_CHUNKS);

    const allCandidates: { title: string; description: string; acceptanceCriteria: string; type: string }[] = [];

    for (const chunk of chunksToProcess) {
      try {
        const msg = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: `Extract user stories from this document section. Return only valid JSON — an array of story objects. Each story must have: title (string), description (string), acceptanceCriteria (string), type ("feature"|"bug"|"chore"). Extract as many stories as you can find. If no stories found return [].

Document section:
${chunk}

Return ONLY the JSON array, no markdown, no code fences.`,
          }],
        });

        const raw = msg.content[0].type === "text" ? msg.content[0].text : "[]";
        const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
        const parsed = JSON.parse(clean) as { title: string; description: string; acceptanceCriteria: string; type: string }[];
        if (Array.isArray(parsed)) allCandidates.push(...parsed);
      } catch {
        // continue with next chunk
      }
    }

    res.json({
      candidates: allCandidates,
      truncated,
      chunksProcessed: chunksToProcess.length,
      totalChunks: chunks.length,
    });
  });

  // ── Story-level design artifact generation ───────────────────────────────
  app.post("/api/story/design-artifact", async (req, res) => {
    const { title, description, typeId, prerequisiteContext, regenerationContext } = req.body as {
      title: string;
      description?: string;
      typeId: string;
      prerequisiteContext?: Record<string, string>;
      regenerationContext?: string;
    };

    if (!title || !typeId) {
      res.status(400).json({ error: "title and typeId required" });
      return;
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(503).json({ error: "ANTHROPIC_API_KEY not configured" });
      return;
    }

    const prereqSection = prerequisiteContext && Object.keys(prerequisiteContext).length > 0
      ? `\nPrerequisite artifact context:\n${Object.entries(prerequisiteContext).map(([k, v]) => `[${k}]: ${v}`).join("\n\n")}`
      : "";

    const regenerationSection = regenerationContext
      ? `\nThe previous version was rejected. Specific correction required: ${regenerationContext}`
      : "";

    const PLANTUML_RULES = `RULES: Do NOT use !include, !define, or any external URL imports. Use ONLY built-in PlantUML syntax. Keep to under 20 participants/components.`;

    const typeInstructions: Record<string, string> = {
      "user-flow": `Generate an XYFlow diagram JSON showing the end-to-end user journey for this story.
Return ONLY a valid JSON object — no Mermaid, no prose, no code fences.
Use EXACTLY this shape: {"nodes":[{"id":"n1","type":"flowStartEnd","position":{"x":0,"y":0},"data":{"label":"Start"}},{"id":"n2","type":"flowStep","position":{"x":0,"y":0},"data":{"label":"Step","description":"detail"}},{"id":"d1","type":"flowDecision","position":{"x":0,"y":0},"data":{"label":"Decision?"}}],"edges":[{"id":"e1","source":"n1","target":"n2","label":""}]}
Node types: flowStartEnd (start/end), flowStep (process step), flowDecision (branch).
LIMIT: 6-8 nodes maximum, 6-8 edges maximum. Keep it concise.`,

      "technical-architecture": `Generate an XYFlow diagram JSON for the technical architecture of this story.
Return ONLY a valid JSON object — no prose, no code fences.
Shape: {"nodes":[{"id":"s1","type":"c4System","position":{"x":0,"y":0},"data":{"label":"Name","description":"purpose"}},{"id":"db1","type":"c4Database","position":{"x":0,"y":0},"data":{"label":"DB","description":"stores what","technology":"PostgreSQL"}}],"edges":[{"id":"e1","source":"s1","target":"db1","label":"reads/writes"}]}
Node types: c4System, c4Container, c4Database, c4Boundary.
LIMIT: 6-8 nodes maximum, 8-10 edges maximum. The JSON must be complete and valid.`,

      "sequence-diagram": `Generate a PlantUML sequence diagram for the critical path of this story.
${PLANTUML_RULES}
Start with @startuml, use participant declarations, show arrows with labels (->>, -->), end with @enduml.
LIMIT: 5-8 participants, 10-15 messages.`,

      "data-model": `Generate a PlantUML entity-relationship diagram for this story's data model.
${PLANTUML_RULES}
Start with @startuml. Use entity blocks: entity "Table" { *id : INTEGER <<PK>> \n-- \nfield : TYPE }. Show relationships with ||--o{. End with @enduml.
LIMIT: 4-6 entities.`,

      "security-analysis": `Generate an XYFlow diagram JSON showing the security analysis for this story.
Return ONLY a valid JSON object — no prose, no code fences.
Shape: {"nodes":[{"id":"tb1","type":"c4Boundary","position":{"x":0,"y":0},"data":{"label":"Trust Boundary Name","description":"scope"}},{"id":"s1","type":"c4System","position":{"x":0,"y":0},"data":{"label":"Service","description":"Threat: X | Mitigation: Y"}}],"edges":[{"id":"e1","source":"s1","target":"s2","label":"[TLS] data flow"}]}
Node types: c4Boundary (trust boundary zone), c4System (external actors/services), c4Container (internal services), c4Database (data stores).
Put threat and mitigation in the node description field. Label edges with security controls (e.g. [JWT], [TLS], [sanitized]).
LIMIT: 5-7 nodes, 5-7 edges. JSON must be complete and valid.`,

      "deployment-notes": `Generate a deployment notes document in Markdown for this story with these sections:
## Environment Configuration
## Pre-Deployment Checklist
## Deployment Steps
## Health Checks
## Rollback Plan`,

      "api-design": `Generate a JSON array of API endpoint specs: [{"method":"GET","path":"/resource","description":"what it does","request":"body schema","response":"response schema"},...]. Return only the JSON array. LIMIT: 6-8 endpoints.`,

      "solution-architecture": `Generate an XYFlow diagram JSON for the solution architecture.
Return ONLY valid JSON: {"nodes":[{"id":"s1","type":"c4System","position":{"x":0,"y":0},"data":{"label":"Name","description":"purpose"}}],"edges":[{"id":"e1","source":"s1","target":"s2","label":"uses"}]}
LIMIT: 5-7 nodes, 5-8 edges.`,

      "deployment-architecture": `Generate an XYFlow diagram JSON for the deployment architecture.
Return ONLY valid JSON: {"nodes":[{"id":"c1","type":"c4Container","position":{"x":0,"y":0},"data":{"label":"Service","description":"role","technology":"Docker"}}],"edges":[{"id":"e1","source":"c1","target":"c2","label":"connects"}]}
LIMIT: 5-7 nodes, 5-8 edges.`,

      "security-architecture": `Generate a PlantUML component diagram for the project security architecture.
${PLANTUML_RULES}
Show trust boundaries, auth flows, and security controls. Use @startuml/@enduml.
LIMIT: 5-7 components.`,

      "compliance-mapping": `Generate a JSON array: [{"requirement":"Standard Article","control":"what we do","status":"implemented|partial|gap","notes":"detail"},...]. Return only the JSON array. LIMIT: 6-10 items.`,

      "technology-stack": `Generate a Markdown technology stack document with ## sections for: Language, Framework, Database, Caching, Infrastructure, Authentication, Monitoring. One chosen technology per section with one sentence rationale.`,

      "component-architecture": `Generate an XYFlow diagram JSON for the component architecture.
Return ONLY valid JSON: {"nodes":[{"id":"c1","type":"c4Container","position":{"x":0,"y":0},"data":{"label":"Service","description":"role","technology":"Node.js"}}],"edges":[{"id":"e1","source":"c1","target":"c2","label":"calls"}]}
LIMIT: 5-7 nodes, 5-8 edges.`,
    };

    const instruction = typeInstructions[typeId] ?? `Generate appropriate design artifact content for "${typeId}" as plain text.`;

    const xyflowTypes = new Set(["user-flow", "technical-architecture", "solution-architecture", "deployment-architecture", "component-architecture", "security-analysis", "deployment-notes-xyflow"]);
    const plantumlTypes = new Set(["sequence-diagram", "data-model", "security-architecture"]);

    // XYFlow requires precise JSON structure — use Sonnet; Haiku ignores the format instructions
    const model = xyflowTypes.has(typeId) ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001";
    // 4096 tokens is enough for a concise XYFlow diagram (6-8 nodes/edges ≈ 800 tokens)
    const maxTokens = 4096;

    try {
      const msg = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        messages: [{
          role: "user",
          content: `You are the Architecture Agent in Arkitekt Forge. Generate a ${typeId} design artifact.

Story: ${title}
Description: ${description ?? "No description provided"}${prereqSection}${regenerationSection}

${instruction}

Return ONLY the artifact content (JSON, PlantUML source, or markdown as specified). No preamble, no explanation.`,
        }],
      });

      const raw = msg.content[0].type === "text" ? msg.content[0].text : "";

      let clean: string;
      let renderedSvg: string | undefined;

      if (xyflowTypes.has(typeId)) {
        clean = extractJSON(raw);
        // Validate the JSON is complete and parseable — truncated output causes "Raw content" errors
        try {
          const parsed = JSON.parse(clean) as { nodes?: unknown; edges?: unknown };
          if (!Array.isArray(parsed.nodes)) {
            res.status(422).json({ error: "Generated diagram is missing nodes. Please retry." });
            return;
          }
        } catch {
          res.status(422).json({ error: "Generated JSON is incomplete (token limit hit). Please retry." });
          return;
        }
      } else if (plantumlTypes.has(typeId)) {
        clean = extractPlantUML(raw);
        // Pre-render SVG so client can display without an extra round-trip
        try {
          const encoded = await encodePlantUML(clean);
          const serverUrl = process.env.PLANTUML_SERVER_URL ?? "http://localhost:8080";
          const svgRes = await fetch(`${serverUrl}/svg/${encoded}`);
          if (svgRes.ok) renderedSvg = await svgRes.text();
        } catch {
          // non-fatal — client will request render on its own
        }
      } else {
        clean = raw.replace(/^```(?:json|plantuml|markdown)?\s*/im, "").replace(/\s*```\s*$/im, "").trim();
      }

      res.json({ content: clean, ...(renderedSvg ? { renderedSvg } : {}) });
    } catch (err) {
      console.error("Design artifact generation error:", err);
      res.status(500).json({ error: "Agent failed to generate artifact" });
    }
  });

  // ── Project-level design artifact generation ─────────────────────────────
  app.post("/api/project/design-artifact", async (req, res) => {
    const { projectName, projectDescription, typeId, prerequisiteContext, regenerationContext } = req.body as {
      projectName: string;
      projectDescription?: string;
      typeId: string;
      prerequisiteContext?: Record<string, string>;
      regenerationContext?: string;
    };

    if (!projectName || !typeId) {
      res.status(400).json({ error: "projectName and typeId required" });
      return;
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(503).json({ error: "ANTHROPIC_API_KEY not configured" });
      return;
    }

    const prereqSection = prerequisiteContext && Object.keys(prerequisiteContext).length > 0
      ? `\nPrerequisite context:\n${Object.entries(prerequisiteContext).map(([k, v]) => `[${k}]: ${v}`).join("\n\n")}`
      : "";

    const regenerationSection = regenerationContext
      ? `\nThe previous version was rejected. Specific correction required: ${regenerationContext}`
      : "";

    const typeInstructions: Record<string, string> = {
      "solution-architecture": `Generate an XYFlow diagram JSON for the project solution architecture. Use c4System and c4Boundary node types showing the overall system context. Return JSON: {"nodes": [...], "edges": [...]}. Nodes: {id, type, position:{x:0,y:0}, data:{label,description}}.`,
      "deployment-architecture": `Generate an XYFlow diagram JSON for the project deployment architecture. Show cloud regions, services, and infrastructure. Return JSON: {"nodes": [...], "edges": [...]}. Nodes: {id, type, position:{x:0,y:0}, data:{label,description,technology}}.`,
      "security-architecture": `Generate PlantUML diagram source showing the project's security architecture, trust boundaries, authentication flows, and security controls. Use @startuml/@enduml.`,
      "compliance-mapping": `Generate a JSON array of project-wide compliance requirements: [{"requirement":"Standard","control":"implementation","status":"implemented|partial|gap","notes":"detail"},...]. Cover PDPL, NCA ECC, ISO 27001 as applicable.`,
      "technology-stack": `Generate a comprehensive markdown technology stack document for the project. Include: ## Language, ## Framework, ## Database, ## Caching, ## Infrastructure, ## Authentication, ## Monitoring sections, each with chosen technology and rationale.`,
    };

    const instruction = typeInstructions[typeId] ?? `Generate a project-level ${typeId} artifact as structured content.`;

    const xyflowProjectTypes = new Set(["solution-architecture", "deployment-architecture"]);
    const plantumlProjectTypes = new Set(["security-architecture"]);
    const projectModel = xyflowProjectTypes.has(typeId) ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001";
    const projectMaxTokens = xyflowProjectTypes.has(typeId) ? 3000 : 2000;

    try {
      const msg = await anthropic.messages.create({
        model: projectModel,
        max_tokens: projectMaxTokens,
        messages: [{
          role: "user",
          content: `You are the Architecture Agent in Arkitekt Forge. Generate a project-level ${typeId} artifact.

Project: ${projectName}
Description: ${projectDescription ?? "No description provided"}${prereqSection}${regenerationSection}

${instruction}

Return ONLY the artifact content. No preamble, no explanation.`,
        }],
      });

      const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
      let clean: string;
      if (xyflowProjectTypes.has(typeId)) clean = extractJSON(raw);
      else if (plantumlProjectTypes.has(typeId)) clean = extractPlantUML(raw);
      else clean = raw.replace(/^```(?:json|plantuml|markdown)?\s*/im, "").replace(/\s*```\s*$/im, "").trim();

      res.json({ content: clean });
    } catch (err) {
      console.error("Project artifact generation error:", err);
      res.status(500).json({ error: "Agent failed to generate project artifact" });
    }
  });

  // ── Epic-level design artifact generation ────────────────────────────────
  app.post("/api/epic/design-artifact", async (req, res) => {
    const { epicName, epicDescription, typeId, prerequisiteContext, regenerationContext } = req.body as {
      epicName: string;
      epicDescription?: string;
      typeId: string;
      prerequisiteContext?: Record<string, string>;
      regenerationContext?: string;
    };

    if (!epicName || !typeId) {
      res.status(400).json({ error: "epicName and typeId required" });
      return;
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(503).json({ error: "ANTHROPIC_API_KEY not configured" });
      return;
    }

    const prereqSection = prerequisiteContext && Object.keys(prerequisiteContext).length > 0
      ? `\nPrerequisite context:\n${Object.entries(prerequisiteContext).map(([k, v]) => `[${k}]: ${v}`).join("\n\n")}`
      : "";

    const regenerationSection = regenerationContext
      ? `\nThe previous version was rejected. Specific correction required: ${regenerationContext}`
      : "";

    const typeInstructions: Record<string, string> = {
      "component-architecture": `Generate an XYFlow diagram JSON for the epic's component architecture. Use c4Container and c4Component node types. Return JSON: {"nodes": [...], "edges": [...]}. Nodes: {id, type, position:{x:0,y:0}, data:{label,description,technology}}.`,
      "data-model": `Generate PlantUML entity diagram source showing the epic's data model — entities, attributes, and relationships. Use @startuml/@enduml with entity notation.`,
      "api-design": `Generate a JSON array of API specifications for this epic: [{"method":"GET","path":"/resource","description":"purpose","request":"schema","response":"schema"},...]. Return only the JSON array.`,
    };

    const instruction = typeInstructions[typeId] ?? `Generate an epic-level ${typeId} artifact as structured content.`;

    const xyflowEpicTypes = new Set(["component-architecture"]);
    const plantumlEpicTypes = new Set(["data-model"]);
    const epicModel = xyflowEpicTypes.has(typeId) ? "claude-sonnet-4-6" : "claude-haiku-4-5-20251001";
    const epicMaxTokens = xyflowEpicTypes.has(typeId) ? 3000 : 2000;

    try {
      const msg = await anthropic.messages.create({
        model: epicModel,
        max_tokens: epicMaxTokens,
        messages: [{
          role: "user",
          content: `You are the Architecture Agent in Arkitekt Forge. Generate an epic-level ${typeId} artifact.

Epic: ${epicName}
Description: ${epicDescription ?? "No description provided"}${prereqSection}${regenerationSection}

${instruction}

Return ONLY the artifact content. No preamble, no explanation.`,
        }],
      });

      const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
      let clean: string;
      if (xyflowEpicTypes.has(typeId)) clean = extractJSON(raw);
      else if (plantumlEpicTypes.has(typeId)) clean = extractPlantUML(raw);
      else clean = raw.replace(/^```(?:json|plantuml|markdown)?\s*/im, "").replace(/\s*```\s*$/im, "").trim();

      res.json({ content: clean });
    } catch (err) {
      console.error("Epic artifact generation error:", err);
      res.status(500).json({ error: "Agent failed to generate epic artifact" });
    }
  });

  // ── PlantUML render proxy ────────────────────────────────────────────────
  app.post("/api/plantuml/render", async (req, res) => {
    const { source } = req.body as { source: string };
    if (!source) {
      res.status(400).json({ error: "source is required" });
      return;
    }

    // Strip lines that reference external URLs — PlantUML server returns 400 for those
    const sanitized = source
      .split("\n")
      .filter(line => {
        const t = line.trim();
        return !(t.startsWith("!include ") && (t.includes("http") || t.includes("github")))
            && !(t.startsWith("!define ") && (t.includes("http") || t.includes("github")));
      })
      .join("\n");

    const serverUrl = process.env.PLANTUML_SERVER_URL ?? "http://localhost:8080";

    try {
      const encoded = await encodePlantUML(sanitized);
      const svgUrl = `${serverUrl}/svg/${encoded}`;
      const response = await fetch(svgUrl);
      if (!response.ok) {
        res.status(502).json({ error: `PlantUML server returned ${response.status}` });
        return;
      }
      const svg = await response.text();
      res.json({ svg });
    } catch (err) {
      console.error("PlantUML render error:", err);
      res.status(502).json({ error: "PlantUML server unavailable" });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
