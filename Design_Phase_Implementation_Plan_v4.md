# Arkitekt Forge: Design Phase Implementation Plan v4.0

**Version:** 4.0 (Corrected, Execution Ready)
**Date:** 3 May 2026
**Supersedes:** Design_Phase_Implementation_Plan.md (v3.0)

**Key corrections from v3.0:**
- `pnpm remove mermaid` moved from Phase 2 to Phase 13. Removing the package while MermaidDiagram.tsx still imports from it would break the build immediately. Safe sequence: remove all consumers first, delete files, then remove package.
- `@shared` alias already configured in vite.config.ts and tsconfig.json — no config changes needed.
- `ArtifactStatus` type kept intact (locked/available/generating/draft/approved/rejected). New `ProjectArtifactStatus` type added for project/epic artifacts — no collision.
- `ARTIFACT_CONFIGS` naming fixed — keep `artifactRegistry` array + `getArtifactConfig()` accessor pattern.
- `stakeholderViews` field on ArtifactTypeConfig stays as `StakeholderViewId[]` — no shape change.
- `ArtifactTypeId` union extended to include `"technology-stack"`.
- `addAuditEvent` calls use existing event types (`"ai-action"`, `"approval"`).
- `currentUser.email` replaced with `currentUser.name`.
- `generateProofHash()` replaced with `generateId()` (existing helper).
- `MemoryEvent.summary/sourcePhase/confidence` replaced with `.title/.kind/.time`.
- `Project.description` added as optional field.
- All `'use client'` directives removed (this is Vite, not Next.js).
- `DesignContextPanel` reads `storyList` not `stories`.
- `ForgeContextValue` interface explicitly updated.
- MermaidDiagram deletion order: consumers first, then file deletion, then package removal (all in Phase 13).

---

## Architecture: Three-Tier Design Model

- **Tier 1 — Project Level**: solution-architecture, deployment-architecture, security-architecture, compliance-mapping, technology-stack. Generated once per project. Managed in Architecture screen.
- **Tier 2 — Epic Level**: component-architecture, data-model, api-design. One set per Epic. Managed in Epic panel (story drawer + Architecture screen sidebar).
- **Tier 3 — Story Level**: user-flow, sequence-diagram, technical-architecture. Per-story. Managed in Story drawer.

**Renderers:**
- `xyflow` — @xyflow/react interactive canvas (replaces Mermaid for node-edge diagrams)
- `plantuml` — Self-hosted PlantUML server (replaces Mermaid for UML diagrams)
- `table` — JSON array rendered as a data table
- `markdown` — Markdown text rendered as formatted prose

---

## Phase 1: Type Definitions

### 1.1 Create `shared/types/designArtifacts.ts`

```typescript
export type ProjectArtifactStatus =
  | 'not_generated'
  | 'generating'
  | 'draft'
  | 'approved'
  | 'rejected';

export type ArtifactScope = 'project' | 'epic' | 'story';
export type ArtifactRenderer = 'xyflow' | 'plantuml' | 'table' | 'markdown';

export interface XYFlowDocument {
  nodes: XYFlowNode[];
  edges: XYFlowEdge[];
  viewport?: { x: number; y: number; zoom: number };
}

export interface XYFlowNode {
  id: string;
  type: 'c4System' | 'c4Container' | 'c4Component' | 'c4Database' | 'c4Boundary'
      | 'flowStep' | 'flowDecision' | 'flowStartEnd' | 'stateNode';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    technology?: string;
    color?: string;
  };
  parentId?: string;
  width?: number;
  height?: number;
}

export interface XYFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'labeled' | 'default';
  label?: string;
  animated?: boolean;
  data?: { protocol?: string; description?: string };
}

export interface ProjectDesignArtifact {
  id: string;
  projectId: string;
  typeId: string;
  scope: 'project';
  status: ProjectArtifactStatus;
  content: string;
  renderedSvg?: string;
  generatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  proofHash?: string;
  version: number;
}

export interface EpicDesignArtifact {
  id: string;
  epicId: string;
  projectId: string;
  typeId: string;
  scope: 'epic';
  status: ProjectArtifactStatus;
  content: string;
  renderedSvg?: string;
  generatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  proofHash?: string;
  version: number;
}

export type DesignExportType = 'png' | 'svg' | 'drawio' | 'json' | 'zip';
```

### 1.2 Extend `client/src/forge/types.ts`

Add to existing file (no existing types removed or modified):

```typescript
// Epic entity
export type Epic = {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: "active" | "completed" | "on-hold";
  storyCount: number;
  owner: string;
  createdAt: string;
};
```

Surgical edits to existing types:

- `Story`: add `epicId?: string`
- `ArtifactTypeId` union: add `| "technology-stack"`
- `ArtifactTypeConfig`: add `scope: "project" | "epic" | "story"` and `renderer: "xyflow" | "plantuml" | "table" | "markdown"`
- `Project`: add `description?: string`

---

## Phase 2: Install New Packages Only

**NOTE: Do NOT remove mermaid here. Mermaid package stays until Phase 13.**

```bash
pnpm add @xyflow/react @dagrejs/dagre html-to-image jszip file-saver
pnpm add -D @types/file-saver
```

Verify build passes before proceeding.

---

## Phase 3: Artifact Registry Update

**File:** `client/src/forge/artifactRegistry.ts`

### 3.1 Add scope and renderer to all existing entries

Keep `artifactRegistry` array name and `getArtifactConfig()` accessor — do NOT rename to ARTIFACT_CONFIGS.

| Artifact ID | scope | renderer |
|---|---|---|
| solution-architecture | project | xyflow |
| deployment-architecture | project | xyflow |
| security-architecture | project | plantuml |
| compliance-mapping | project | table |
| component-architecture | epic | xyflow |
| data-model | epic | plantuml |
| api-design | epic | table |
| user-flow | story | xyflow |
| sequence-diagram | story | plantuml |
| technical-architecture | story | xyflow |

### 3.2 Add technology-stack entry

```typescript
{
  id: "technology-stack",
  label: "Technology Stack",
  description: "Language, framework, database, and infrastructure decisions with rationale",
  outputType: "text",
  contextPassMode: "summarizable",
  prerequisites: ["solution-architecture"],
  mandatory: false,
  scope: "project",
  renderer: "markdown",
  stakeholderViews: ["cto", "engineer", "devops"],
  agentName: "Architecture Agent",
}
```

### 3.3 Update checkDesignGate — backwards compatible

```typescript
export function checkDesignGate(
  storyArtifacts: Partial<Record<ArtifactTypeId, StoryDesignArtifact>>,
  projectArtifacts?: import("@shared/types/designArtifacts").ProjectDesignArtifact[],
  epicArtifacts?: import("@shared/types/designArtifacts").EpicDesignArtifact[],
): {
  passed: boolean;
  missing: string[];
  tier1Passed: boolean;
  tier2Passed: boolean;
  tier3Passed: boolean;
  approvedCount: number;
  totalRequired: number;
}
```

When called with only `storyArtifacts` (existing callers), tier1Passed and tier2Passed default to true.

### 3.4 Add scope helper functions

```typescript
export function getArtifactsByScope(scope: "project" | "epic" | "story"): ArtifactTypeConfig[]
export function getProjectArtifactConfigs(): ArtifactTypeConfig[]
export function getEpicArtifactConfigs(): ArtifactTypeConfig[]
export function getStoryArtifactConfigs(): ArtifactTypeConfig[]
```

---

## Phase 4: XYFlow Diagram Components

### 4.1 `client/src/forge/layout/dagre.ts`

Auto-layout using @dagrejs/dagre. TB direction, 60px horizontal gap, 80px vertical gap, 180x60 default node size.

### 4.2 `client/src/forge/components/nodes/`

Nine node components + index:

| File | Style | Use case |
|---|---|---|
| C4SystemNode.tsx | Blue box (#1168bd) | External systems |
| C4ContainerNode.tsx | Medium blue (#438dd5) | Containers/apps |
| C4ComponentNode.tsx | Light blue (#85bbf0), dark text | Internal components |
| C4DatabaseNode.tsx | Cylinder shape, #438dd5 | Databases |
| C4BoundaryNode.tsx | Dashed border, transparent fill | System boundary group |
| FlowStepNode.tsx | White pill/rounded-full | User journey step |
| FlowDecisionNode.tsx | Diamond (rotate 45deg) | Decision point |
| FlowStartEndNode.tsx | Filled circle (green=start, red=end) | Flow terminals |
| StateNode.tsx | Rounded rect with colored left border | State machine state |

`nodes/index.ts` exports `customNodeTypes` record.

### 4.3 `client/src/forge/components/edges/LabeledEdge.tsx`

Bezier edge with protocol label pill using `EdgeLabelRenderer` from @xyflow/react.

### 4.4 `client/src/forge/components/XYFlowDiagram.tsx`

Props: `{ sourceContent: string; readOnly?: boolean; title?: string; className?: string }`

- Parses sourceContent as XYFlowDocument JSON
- Applies dagre layout if all nodes at {0,0}
- Renders ReactFlow with MiniMap, Controls, Background (dots, gap=16, #e2e8f0)
- Top-right panel: Download PNG button (html-to-image)
- Error: raw JSON in `<pre>` (graceful fallback)
- readOnly=true: disables drag/connect/select
- Height: 400px default, configurable via className

---

## Phase 5: PlantUML Components

### 5.1 Add to docker-compose.yml

```yaml
plantuml:
  image: plantuml/plantuml-server:jetty
  ports:
    - "8080:8080"
  restart: unless-stopped
```

Env var: `PLANTUML_SERVER_URL` defaults to `http://localhost:8080`.

### 5.2 Server route `POST /api/plantuml/render`

Accepts: `{ source: string }`
Encodes PlantUML source (deflate + base64url), proxies GET to `${PLANTUML_SERVER_URL}/svg/{encoded}`, returns `{ svg: string }`.

### 5.3 `client/src/forge/components/PlantUMLDiagram.tsx`

Props: `{ source: string; readOnly?: boolean; title?: string; className?: string }`

- On mount: POST /api/plantuml/render
- Loading: animated skeleton (h-40, bg-slate-100, animate-pulse)
- Error: raw source in `<pre>` (same graceful fallback as current MermaidDiagram)
- Success: SVG via dangerouslySetInnerHTML
- Toolbar: "Show source" toggle (Code2 icon) + "Download SVG" button
- No 'use client' directive

---

## Phase 6: Export Utilities

### 6.1 `client/src/forge/export/toDrawio.ts`

Converts XYFlowDocument to .drawio XML. NODE_STYLE_MAP maps each node type to mxGraph style string. Deterministic output.

### 6.2 `client/src/forge/export/toPng.ts`

Wrapper: `html-to-image` toPng, pixelRatio=2, white background, triggers download.

### 6.3 `client/src/forge/export/toZip.ts`

jszip + file-saver. Per artifact: .json (xyflow), .puml (plantuml), .md (markdown), .svg if rendered, .drawio for xyflow. ZIP: `{projectName}_Design_Pack.zip`.

### 6.4 `client/src/forge/components/DesignArtifactExport.tsx`

Radix DropdownMenu trigger (Download icon). Items: PNG, SVG, Draw.io (xyflow only), JSON, ZIP. Forge tokens: rounded-xl, border-slate-200, text-[11px].

---

## Phase 7: Context Provider Updates

**File:** `client/src/forge/context.tsx`

### 7.1 New state declarations

```typescript
const [epicList, setEpicList] = useState<Epic[]>([]);
const [projectDesignArtifacts, setProjectDesignArtifacts] = useState<ProjectDesignArtifact[]>([]);
const [epicDesignArtifacts, setEpicDesignArtifacts] = useState<EpicDesignArtifact[]>([]);
```

### 7.2 createEpic function

Creates Epic with projectId=activeProjectId, id=`epic-${generateId()}`, status="active", createdAt=now. Fires addAuditEvent({ type: "config-change", ... }).

### 7.3 generateProjectArtifact(projectId, typeId)

1. Validate scope === 'project'
2. Check prerequisites approved in projectDesignArtifacts
3. Set status 'generating'
4. POST /api/project/design-artifact with { projectId, typeId, renderer: config.renderer, prerequisiteContext, projectDescription: activeProject?.name ?? '' }
5. On success: status 'draft', store content + renderedSvg
6. addAuditEvent({ type: "ai-action", title: `${config.label} generated`, detail: `Generated for project ${projectId}`, actor: currentUser.name, actorRole: currentUser.role, timestamp: ..., proofHash: generateId() })
7. On error: revert to 'not_generated'

### 7.4 approveProjectArtifact(artifactId)

Sets status 'approved', approvedBy: currentUser.name (NOT .email).
addAuditEvent({ type: "approval", ... })

### 7.5 rejectProjectArtifact(artifactId, reason)

Sets status 'rejected', rejectionReason.
addAuditEvent({ type: "approval", ... })

### 7.6 generateEpicArtifact / approveEpicArtifact / rejectEpicArtifact

Same pattern as project functions. POST /api/epic/design-artifact. Prerequisite context includes approved Tier 1 artifacts.

### 7.7 Update ForgeContextValue interface

Add all new state and 7 new functions to the interface (epicList, projectDesignArtifacts, epicDesignArtifacts, createEpic, generateProjectArtifact, approveProjectArtifact, rejectProjectArtifact, generateEpicArtifact, approveEpicArtifact, rejectEpicArtifact).

---

## Phase 8: DesignContextPanel

**File:** `client/src/forge/components/DesignContextPanel.tsx`

Props: `{ storyId: string; epicId?: string; projectId: string }`

Reads: `const { storyList, projectDesignArtifacts, epicDesignArtifacts } = useForge()`
Story lookup: `storyList.find(s => s.id === storyId)` — NOT `stories`

Memory events use EXISTING fields only:
- `pattern.title` (not .summary)
- `pattern.kind` (not .sourcePhase)
- `pattern.time` (not .confidence)

Three sections: Upstream Project Context, Epic Context (if epicId), Proof Chain badge.

---

## Phase 9: Architecture Screen Refactor

**File:** `client/src/forge/screens/ArchitectureScreen.tsx`

New purpose: Tier 1 project artifact management.

Layout (preserve 2-column):
- Left: Tier 1 artifact cards. Each: label, renderer badge, status pill, inline preview (XYFlowDiagram/PlantUMLDiagram at height 250), Generate/Approve/Reject buttons, DesignArtifactExport top-right.
- Right: GitHubPanel (preserved) + project gate progress bar + epic list with Tier 2 completion %.

Header "Export All" triggers exportDesignPack(). Imports XYFlowDiagram, PlantUMLDiagram, DesignArtifactExport. Does NOT import legacy DesignArtifactCard or DesignArtifactModal.

---

## Phase 10: ArtifactDependencyMap and StoryDetailDrawer

### 10.1 ArtifactDependencyMap.tsx

Add renderer routing function:

```typescript
function renderArtifactContent(
  artifact: { content: string; renderedSvg?: string },
  config: ArtifactTypeConfig,
  title: string
) {
  switch (config.renderer) {
    case 'xyflow':
      return <XYFlowDiagram sourceContent={artifact.content} readOnly title={title} />;
    case 'plantuml':
      return <PlantUMLDiagram source={artifact.content} readOnly title={title} />;
    case 'table':
      return <TableArtifactRenderer content={artifact.content} />;
    case 'markdown':
      return <MarkdownArtifactRenderer content={artifact.content} />;
  }
}
```

Add Tier 1 and Tier 2 read-only sections above existing story layers. Replace existing ArtifactContent (Mermaid) with renderArtifactContent(). Add DesignArtifactExport to each story artifact card.

Create `TableArtifactRenderer.tsx` and `MarkdownArtifactRenderer.tsx` as small inline components.

### 10.2 StoryDetailDrawer.tsx

Update design gate check:
```typescript
const { projectDesignArtifacts, epicDesignArtifacts } = useForge();
const designGate = story?.phase === "Design"
  ? checkDesignGate(
      story.storyDesignArtifacts ?? {},
      projectDesignArtifacts.filter(a => a.projectId === activeProjectId),
      story.epicId ? epicDesignArtifacts.filter(a => a.epicId === story.epicId) : [],
    )
  : { passed: true, missing: [], tier1Passed: true, tier2Passed: true, tier3Passed: true, approvedCount: 0, totalRequired: 0 };
```

Add DesignContextPanel in expanded drawer right panel.

**REMOVE the MermaidDiagram import** (line 21) — no longer used after ArtifactDependencyMap migrated.

---

## Phase 11: Server Endpoints

### POST /api/project/design-artifact

Accepts: `{ projectId, typeId, renderer, prerequisiteContext, projectDescription }`

For xyflow renderer: AI generates valid XYFlowDocument JSON.
For plantuml renderer: AI generates PlantUML source, render via PlantUML server, return source + SVG.
For table: AI generates JSON array.
For markdown: AI generates markdown.
Returns: `{ id, content, renderedSvg?, proofHash }` where proofHash = `crypto.randomBytes(6).toString('hex')`.

### POST /api/epic/design-artifact

Same pattern. Extra context: inject all approved Tier 1 project artifacts before artifact-specific prereqs.

---

## Phase 12: Seed Data

**File:** `client/src/forge/data/designArtifacts.ts`

Add `seedProjectArtifacts: ProjectDesignArtifact[]` with:
- One approved solution-architecture (XYFlowDocument JSON with nodes at {0,0}, dagre auto-layouts on render)
- One draft deployment-architecture

Add `seedEpicArtifacts: EpicDesignArtifact[]` with:
- One approved component-architecture for epic-1

Import in context.tsx to seed initial state.

---

## Phase 13: Mermaid Removal (LAST — after build passes on Phase 12)

**Sequence within this phase is strict:**

### Step 1: Remove all MermaidDiagram imports

Verify no remaining consumers:
```bash
grep -r "MermaidDiagram" client/src/ --include="*.tsx" --include="*.ts"
grep -r "from.*mermaid" client/src/ --include="*.tsx" --include="*.ts"
```

If any remain, fix them before proceeding.

### Step 2: Delete legacy files

```
client/src/forge/components/MermaidDiagram.tsx
client/src/forge/components/DesignArtifactCard.tsx
client/src/forge/components/DesignArtifactModal.tsx
```

### Step 3: Remove mermaid package

```bash
pnpm remove mermaid
```

### Step 4: Final build verification

```bash
pnpm build
```

Must pass with zero errors and zero warnings about missing modules.

---

## Execution Order

1. Phase 1 — Types → build check
2. Phase 2 — Install packages (no mermaid removal) → build check
3. Phase 3 — Registry → build check
4. Phase 4 — XYFlow components → build check
5. Phase 5 — PlantUML components + server route + docker → build check
6. Phase 6 — Export utilities → build check
7. Phase 7 — Context provider → build check
8. Phase 8 — DesignContextPanel → build check
9. Phase 9 — Architecture screen → build check
10. Phase 10 — ArtifactDependencyMap + StoryDetailDrawer → build check
11. Phase 11 — Server endpoints → server restart
12. Phase 12 — Seed data → visual check
13. Phase 13 — Mermaid removal → FINAL build check

**Each phase must pass `pnpm build` before the next phase starts.**

---

## Testing Checklist (before asking user to test)

- [ ] `pnpm build` passes with zero errors
- [ ] `pnpm lint` passes
- [ ] Grep for mermaid imports returns zero results
- [ ] Architecture screen loads and shows Tier 1 artifact cards
- [ ] "Generate with AI" on solution-architecture triggers API call
- [ ] XYFlow diagram renders with nodes, minimap, controls
- [ ] PlantUML diagram renders SVG (requires PlantUML container running)
- [ ] PlantUML error fallback shows raw source when container is down
- [ ] Approve button moves artifact to approved status
- [ ] Reject shows reason input, moves to rejected
- [ ] Story drawer shows Tier 1 and Tier 2 read-only sections
- [ ] DesignContextPanel shows upstream artifacts correctly
- [ ] Design Gate progress bar reflects tier breakdown
- [ ] Export dropdown appears per artifact
- [ ] Download PNG works for XYFlow diagrams
- [ ] Download SVG works for PlantUML diagrams
- [ ] ZIP export includes all approved artifacts
- [ ] Existing kanban (Plan/Design/Develop columns) still works
- [ ] Story create dialog still works
- [ ] BRD import still works
- [ ] No console errors in browser DevTools

---

## Files Summary

| File | Action | Phase |
|---|---|---|
| shared/types/designArtifacts.ts | CREATE | 1 |
| client/src/forge/types.ts | EXTEND (add Epic, epicId, ArtifactTypeId, scope/renderer fields) | 1 |
| client/src/forge/artifactRegistry.ts | EXTEND (scope, renderer, technology-stack, helpers, gate) | 3 |
| client/src/forge/layout/dagre.ts | CREATE | 4 |
| client/src/forge/components/nodes/* (9 files) | CREATE | 4 |
| client/src/forge/components/edges/LabeledEdge.tsx | CREATE | 4 |
| client/src/forge/components/XYFlowDiagram.tsx | CREATE | 4 |
| docker-compose.yml | EXTEND (plantuml service) | 5 |
| server route plantuml | CREATE | 5 |
| client/src/forge/components/PlantUMLDiagram.tsx | CREATE | 5 |
| client/src/forge/export/toDrawio.ts | CREATE | 6 |
| client/src/forge/export/toPng.ts | CREATE | 6 |
| client/src/forge/export/toZip.ts | CREATE | 6 |
| client/src/forge/components/DesignArtifactExport.tsx | CREATE | 6 |
| client/src/forge/context.tsx | EXTEND (state, 7 functions, interface) | 7 |
| client/src/forge/components/DesignContextPanel.tsx | CREATE | 8 |
| client/src/forge/screens/ArchitectureScreen.tsx | REFACTOR | 9 |
| client/src/forge/components/ArtifactDependencyMap.tsx | EXTEND (tiers, renderer routing) | 10 |
| client/src/forge/components/TableArtifactRenderer.tsx | CREATE | 10 |
| client/src/forge/components/MarkdownArtifactRenderer.tsx | CREATE | 10 |
| client/src/forge/screens/StoryDetailDrawer.tsx | MODIFY (gate, context panel, remove mermaid import) | 10 |
| server design endpoints | CREATE | 11 |
| client/src/forge/data/designArtifacts.ts | REPLACE (new seed format) | 12 |
| client/src/forge/components/MermaidDiagram.tsx | DELETE | 13 |
| client/src/forge/components/DesignArtifactCard.tsx | DELETE | 13 |
| client/src/forge/components/DesignArtifactModal.tsx | DELETE | 13 |

**Total: ~27 new files, ~10 modified files, 3 deleted files**
