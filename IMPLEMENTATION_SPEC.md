# Arkitekt Forge: Full Demo Implementation Spec

> **Purpose**: This document is a complete technical implementation guide for building a fully interactive "smoke and mirrors" client sales demo of Arkitekt Forge. Hand this to Claude Code and it should be able to build everything described here.
>
> **Important**: There is NO backend. Everything runs on local React state, seed data, and pre scripted content. The demo must feel like a real product. Clients should not be able to tell the difference between this and a fully operational platform.
>
> **Formatting rule**: Never use dashes (hyphens, en dashes, em dashes) in any UI text, labels, or copy. Use colons, commas, or rewrite instead.

## Tech Stack (Already Configured)

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Routing | wouter v3 |
| Styling | Tailwind CSS v4 (oklch colors, @theme inline) |
| Animation | framer-motion v12 |
| Charts | recharts v2 |
| Icons | lucide-react v0.453 |
| UI Components | Radix UI (dialog, tabs, dropdown, popover, switch, etc.) |
| Fonts | Manrope (body), Space Grotesk (display) |
| Build | Vite |

## Current File Structure

```
client/src/
├── App.tsx                      # Router with wouter
├── index.css                    # Tailwind + oklch design tokens
├── main.tsx                     # Entry point
├── lib/utils.ts                 # cn() helper
├── forge/
│   ├── types.ts                 # All type definitions
│   ├── data.ts                  # All seed data (1087 lines)
│   ├── context.tsx              # ForgeProvider with React Context
│   ├── ForgeLayout.tsx          # Shared layout (sidebar, header, search, notifications)
│   ├── ForgeWorkspace.tsx       # Screen router with AnimatePresence
│   └── screens/
│       ├── PortfolioScreen.tsx   # Multi tenant/project overview
│       ├── CommandCenter.tsx     # Persona dashboard with metrics
│       ├── DeliveryFlow.tsx      # Kanban board with filtering
│       ├── ContextHub.tsx        # Memory event feed
│       ├── ArchitectureScreen.tsx # Layer view and service impact
│       ├── GovernanceScreen.tsx  # Proof chain, approvals, controls
│       └── ConfigStudio.tsx     # Module toggles (NEEDS FULL REWRITE)
├── components/ui/               # shadcn/radix components (50+ files, all working)
└── hooks/                       # useComposition, useMobile, usePersistFn
```

## Design System (Match Exactly)

```
Card style:      rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]
Hover:           hover:-translate-y-0.5 hover:border-sky-200
Active card:     border-slate-900 bg-slate-950 text-white
Section label:   text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500
Section title:   font-[family-name:var(--font-display)] text-[2rem] font-semibold tracking-[-0.04em] text-slate-950
Pill/badge:      rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1
Button active:   rounded-full border-slate-900 bg-slate-950 text-white
Button inactive: rounded-full border-slate-200 bg-white text-slate-600
Inner card:      rounded-[14px] border border-slate-200 bg-slate-50/60 px-4 py-3
Stat label:      text-sm text-slate-500
Stat value:      mt-1 text-base font-semibold text-slate-950
```

---

# PHASE 1: DATA FOUNDATION

> Build all new types, project templates, persona presets, demo scripts, and state management BEFORE any UI work.

## 1.1 New Types (add to `forge/types.ts`)

```typescript
/* ── Project Types ── */

export type ProjectTypeKey =
  | "full-sdlc"
  | "data-integration"
  | "api-development"
  | "mobile-app"
  | "platform-engineering"
  | "gov-digital-service"
  | "smart-city"
  | "compliance-transformation"
  | "custom";

export type ProjectTemplate = {
  key: ProjectTypeKey;
  name: string;
  description: string;
  icon: string; // lucide icon name
  category: "Engineering" | "Saudi Market" | "Custom";
  phases: { id: string; name: string; states: string[] }[];
  defaultGates: { fromPhase: string; toPhase: string; approvers: number; roles: string[] }[];
  recommendedConnectors: string[]; // connector ids
  recommendedPersonas: PersonaKey[];
  governancePosture: "Standard" | "Enhanced" | "Maximum";
  complianceDefaults: string[]; // e.g. ["PDPL", "NCA_ECC"]
};

/* ── Extended Persona System ── */

export type PersonaKey =
  | "cto"
  | "delivery-lead"
  | "solution-architect"
  | "developer"
  | "qa-lead"
  | "security-officer"
  | "compliance-officer"
  | "product-owner"
  | "devops-lead"
  | "programme-director"
  | string; // allows custom persona keys

export type DashboardWidget =
  | "portfolio-kpis"
  | "release-confidence-trend"
  | "proof-chain-gauge"
  | "phase-distribution"
  | "story-spotlight"
  | "governance-queue"
  | "persona-metrics"
  | "compounding-value"
  | "ci-pipeline-status"
  | "test-coverage-matrix"
  | "compliance-dashboard"
  | "security-scan-results"
  | "active-assignments"
  | "context-quality"
  | "cost-dashboard"
  | "priority-matrix"
  | "architecture-impact"
  | "cross-project-dependencies";

export type PersonaPreset = {
  key: PersonaKey;
  name: string;
  shortLabel: string;
  role: string;
  icon: string; // lucide icon name
  sidebarSummary: string;
  commandSummary: string;
  dashboardWidgets: DashboardWidget[];
  metricPriorities: string[];
  notificationFilters: string[];
  actionPermissions: string[];
  memoryFeedOrder: string[];
  isCustom: boolean;
};

/* ── Story Transitions ── */

export type StoryTransition = {
  id: string;
  storyId: string;
  fromPhase: StoryPhase;
  toPhase: StoryPhase;
  timestamp: string;
  approvedBy: string;
  gatesPassed: string[];
  proofHash: string;
  notes?: string;
};

/* ── Approval Actions ── */

export type ApprovalAction = {
  id: string;
  governanceItemId: string;
  action: "approved" | "rejected" | "deferred";
  actorName: string;
  actorRole: string;
  timestamp: string;
  reason?: string;
  evidenceLinks?: string[];
};

/* ── AI Agent Simulation ── */

export type AIAgentStatus = "idle" | "thinking" | "compiling-context" | "generating" | "complete";

export type AIToolCall = {
  tool: string;
  status: "running" | "complete";
  duration: string;
};

export type AIDemoScript = {
  id: string;
  title: string;
  trigger: string; // what the user "asks"
  agentStatus: AIAgentStatus[];
  toolCalls: AIToolCall[];
  sections: {
    heading: string;
    content: string;
    type: "analysis" | "recommendation" | "evidence" | "code" | "metric";
  }[];
  confidenceScore: number;
};

/* ── Policy Rules ── */

export type PolicySeverity = "Blocking" | "Advisory" | "Info";

export type PolicyRule = {
  id: string;
  title: string;
  description: string;
  category: "Compliance" | "Security" | "Quality" | "Performance";
  severity: PolicySeverity;
  enabled: boolean;
  applicableFrameworks: string[];
};

/* ── Workflow Templates ── */

export type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  phaseCount: number;
  stateCount: number;
  gateType: string;
  nodes: WorkflowNode[];
};

/* ── GitHub Integration ── */

export type GitHubCommit = {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  timestamp: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  branch: string;
  url: string; // real GitHub URL
};

export type GitHubPullRequest = {
  number: number;
  title: string;
  author: string;
  status: "open" | "merged" | "closed";
  reviewStatus: "approved" | "changes-requested" | "pending";
  branch: string;
  targetBranch: string;
  timestamp: string;
  checks: { name: string; status: "passed" | "failed" | "running" }[];
  url: string;
};

export type GitHubRepo = {
  owner: string;
  name: string;
  url: string;
  defaultBranch: string;
  branches: string[];
  lastPush: string;
};

export type GitHubFileNode = {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: GitHubFileNode[];
  language?: string;
  size?: string;
};

/* ── Output/Artifact Viewer ── */

export type OutputArtifact = {
  id: string;
  storyId: string;
  projectId: string;
  title: string;
  type: "live-preview" | "code" | "document" | "diagram" | "api-spec" | "test-report" | "evidence-pack";
  description: string;
  previewUrl?: string; // iframe URL for live preview
  codeSnippet?: string; // code content for code viewer
  language?: string;
  fileTree?: GitHubFileNode[];
  githubUrl?: string;
  timestamp: string;
  generatedBy: string; // persona or "AI Agent"
  phase: StoryPhase;
};

/* ── Audit Trail ── */

export type AuditEvent = {
  id: string;
  type: "state-change" | "approval" | "ai-action" | "config-change" | "connector-event" | "evidence-generated";
  title: string;
  detail: string;
  actor: string;
  actorRole: string;
  timestamp: string;
  proofHash: string;
  relatedStoryId?: string;
  relatedProjectId?: string;
};

/* ── Evidence Export ── */

export type EvidenceExportFormat = "PDF" | "JSON" | "CSV";
export type EvidenceScope = "story" | "project" | "tenant";
export type ComplianceTemplate = "PDPL" | "NCA_ECC" | "SOC2" | "ISO_27001" | "NDMO";

/* ── Demo Mode ── */

export type DemoStep = {
  id: string;
  screen: ScreenKey;
  title: string;
  narration: string;
  highlightSelector?: string;
  action?: string;
  persona?: PersonaKey;
};

/* ── Update existing types ── */

// Add to Project type:
//   projectType: ProjectTypeKey;
//   configuredPersonas: PersonaKey[];
//   complianceRequirements: string[];
//   governancePosture: "Standard" | "Enhanced" | "Maximum";

// Add to Tenant type:
//   totalMemoryEvents: number;
//   patternReuseRate: number;
//   complianceCoverage: number;

// Add "output" to ScreenKey union
```

## 1.2 Create `forge/projectTemplates.ts`

Define 8 project type templates + custom. Each template contains:

```typescript
export const projectTemplates: ProjectTemplate[] = [
  {
    key: "full-sdlc",
    name: "Full SDLC",
    description: "End to end software delivery from planning through release with full governance",
    icon: "Layers3",
    category: "Engineering",
    phases: [
      { id: "plan", name: "Plan", states: ["Pending", "Brief", "Ready Design"] },
      { id: "design", name: "Design", states: ["Designing", "Design Review", "Ready Dev"] },
      { id: "develop", name: "Develop", states: ["Coding", "Testing", "Code Review", "Revisions", "Ready CI"] },
      { id: "test", name: "Test", states: ["CI Running", "CI Pass", "CI Fail"] },
      { id: "ship", name: "Ship", states: ["Shipped", "Released", "Done"] },
    ],
    defaultGates: [
      { fromPhase: "plan", toPhase: "design", approvers: 1, roles: ["delivery-lead", "product-owner"] },
      { fromPhase: "design", toPhase: "develop", approvers: 1, roles: ["solution-architect", "delivery-lead"] },
      { fromPhase: "develop", toPhase: "test", approvers: 1, roles: ["qa-lead", "developer"] },
      { fromPhase: "test", toPhase: "ship", approvers: 2, roles: ["delivery-lead", "cto"] },
    ],
    recommendedConnectors: ["github", "jira", "github-actions", "sonarqube", "slack"],
    recommendedPersonas: ["cto", "delivery-lead", "solution-architect", "developer", "qa-lead"],
    governancePosture: "Standard",
    complianceDefaults: [],
  },
  // ... data-integration: 4 phases (Ingest, Transform, Validate, Deploy)
  // ... api-development: 4 phases (Design, Build, Test, Publish)
  // ... mobile-app: 5 phases (Plan, Design, Build, Test, Release)
  // ... platform-engineering: 3 phases (Design, Provision, Operate)
  // ... gov-digital-service: 7 phases (Directive, Analysis, Design, Build, Test, Compliance, Release)
  //     with PDPL + NCA_ECC defaults, dual approval gates, Maximum governance
  // ... smart-city: 6 phases (Vision, Architecture, Build, Integrate, Test, Operate)
  // ... compliance-transformation: 4 phases (Assess, Map, Implement, Certify)
  // ... custom: empty template, all configurable
];
```

**Fill in ALL 9 templates with realistic phases, states, gates, connectors, and personas.** Each Saudi market template should have compliance defaults (PDPL, NCA_ECC) and Enhanced or Maximum governance.

## 1.3 Create `forge/personaPresets.ts`

Define 10 persona presets:

```typescript
export const personaPresets: PersonaPreset[] = [
  {
    key: "cto",
    name: "CTO / VP Engineering",
    shortLabel: "CTO",
    role: "Chief Technology Officer",
    icon: "Crown",
    sidebarSummary: "Portfolio health, strategic risk, release confidence",
    commandSummary: "See cross project health, risk posture, and compounding value across your portfolio",
    dashboardWidgets: ["portfolio-kpis", "release-confidence-trend", "proof-chain-gauge", "compounding-value", "governance-queue"],
    metricPriorities: ["Release confidence", "Governance coverage", "Risk posture", "Pattern reuse rate"],
    notificationFilters: ["high-severity-approval", "release-ready", "risk-escalation"],
    actionPermissions: ["approve-releases", "view-evidence-packs", "manage-tenants"],
    memoryFeedOrder: ["Lesson learned", "Pattern reuse", "Evidence reuse", "Context link"],
    isCustom: false,
  },
  // ... delivery-lead: assignments, velocity, gate pass rates
  // ... solution-architect: layer impact, dependency graph, design rationale
  // ... developer: active assignment, context quality, code review queue
  // ... qa-lead: test coverage, CI status, defect rate
  // ... security-officer: vulnerability count, compliance gaps, control matrix
  // ... compliance-officer: PDPL alignment, evidence readiness, audit trail
  // ... product-owner: story prioritization, requirement traceability
  // ... devops-lead: pipeline health, deployment frequency, connector status
  // ... programme-director: cross project status, milestone adherence, budget
];
```

**Fill in ALL 10 presets with distinct dashboard widgets, metric priorities, and action permissions.**

## 1.4 Create `forge/demoScripts.ts`

Pre scripted AI agent responses for the typed text simulation:

```typescript
export const demoScripts: AIDemoScript[] = [
  {
    id: "brief-generation",
    title: "Story Brief Generation",
    trigger: "Generate a comprehensive brief for this story",
    agentStatus: ["thinking", "compiling-context", "generating", "complete"],
    toolCalls: [
      { tool: "context_graph_query", status: "complete", duration: "1.2s" },
      { tool: "proof_chain_verify", status: "complete", duration: "0.8s" },
      { tool: "write_file", status: "complete", duration: "0.3s" },
    ],
    sections: [
      {
        heading: "Context Compilation",
        content: "Analysed 142 memory artifacts across 3 related projects. Found 7 reusable patterns from the Citizen Identity Gateway project that apply directly to this authentication service. The Context Hub identified 3 lessons learned from the previous release cycle that should inform the design approach.\n\nKey patterns identified:\n\n1. Nafath integration pattern (reused from Citizen ID, confidence 94%)\n2. PDPL consent flow (validated across 4 projects, zero compliance exceptions)\n3. Session management architecture (adapted from Border Management, reviewed by Sara Malik)",
        type: "analysis",
      },
      {
        heading: "Architecture Impact Assessment",
        content: "This story impacts 3 of 8 architecture layers:\n\nLayer 1 (Customer Interaction): New authentication UI components required\nLayer 3 (Intelligence): Context compiler needs updated patterns for identity verification\nLayer 5 (Data and Context): Session storage schema changes required in PostgreSQL\n\nNo impact on Layer 4 (Governance) or Layer 7 (Workflow Engine). Existing approval gates are sufficient.",
        type: "analysis",
      },
      {
        heading: "Recommendation",
        content: "Proceed with the Nafath integration pattern from Citizen ID. The pattern has been validated across 4 deployments with zero security exceptions. Estimated 40% reduction in design time compared to building from scratch.\n\nSuggested assignees: Omar Rahman (development), Sara Malik (architecture review), Dana Youssef (compliance verification).",
        type: "recommendation",
      },
      {
        heading: "Governance Readiness",
        content: "Current proof chain completeness: 72%\nRequired evidence before design gate: Architecture impact assessment (this document), PDPL data flow mapping, Nafath API security review\nEstimated gate readiness: 2 working days",
        type: "evidence",
      },
    ],
    confidenceScore: 94,
  },
  // ... "architecture-impact": architecture layer analysis with service boundaries
  // ... "governance-check": compliance readiness scan with gap identification
  // ... "code-review": AI assisted code review with security findings
  // ... "release-readiness": release confidence assessment with evidence summary
  // ... "context-compilation": cross project pattern matching and knowledge transfer
];
```

**Create ALL 6 demo scripts with realistic, detailed content. Each should be 3 to 5 sections long with professional enterprise language. No dashes.**

## 1.5 Create `forge/githubData.ts`

Seed data for GitHub integration. This will reference a real GitHub repo once the user provides credentials.

```typescript
// ── REAL GITHUB CONFIGURATION ──
// Organization: TheArkitektai
// Repository: Forge
// URL: https://github.com/TheArkitektai/Forge.git

export const GITHUB_ORG = "TheArkitektai";
export const GITHUB_REPO = "Forge";
export const GITHUB_BASE_URL = `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}`;

export const demoRepo: GitHubRepo = {
  owner: GITHUB_ORG,
  name: GITHUB_REPO,
  url: GITHUB_BASE_URL,
  defaultBranch: "main",
  branches: ["main", "develop", "feature/citizen-auth", "feature/nafath-integration", "release/24.4"],
  lastPush: "2 hours ago",
};

export const demoCommits: GitHubCommit[] = [
  {
    sha: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
    shortSha: "a1b2c3d",
    message: "feat: implement Nafath identity verification flow",
    author: "Omar Rahman",
    timestamp: "2 hours ago",
    filesChanged: 12,
    additions: 847,
    deletions: 23,
    branch: "feature/nafath-integration",
    url: "https://github.com/TheArkitektai/Forge/commit/a1b2c3d",
  },
  // ... 10 to 15 more commits with realistic messages spanning multiple branches
];

export const demoPullRequests: GitHubPullRequest[] = [
  {
    number: 42,
    title: "feat: Citizen Authentication Service with Nafath SSO",
    author: "Omar Rahman",
    status: "open",
    reviewStatus: "pending",
    branch: "feature/citizen-auth",
    targetBranch: "develop",
    timestamp: "3 hours ago",
    checks: [
      { name: "Unit Tests", status: "passed" },
      { name: "Integration Tests", status: "passed" },
      { name: "SonarQube Analysis", status: "passed" },
      { name: "PDPL Compliance Scan", status: "passed" },
      { name: "Security Review", status: "running" },
    ],
    url: "https://github.com/TheArkitektai/Forge/pull/42",
  },
  // ... 5 to 8 more PRs in various states (merged, open, review requested)
];

export const demoFileTree: GitHubFileNode[] = [
  {
    name: "src", path: "src", type: "directory", children: [
      { name: "auth", path: "src/auth", type: "directory", children: [
        { name: "NafathProvider.ts", path: "src/auth/NafathProvider.ts", type: "file", language: "typescript", size: "4.2 KB" },
        { name: "SessionManager.ts", path: "src/auth/SessionManager.ts", type: "file", language: "typescript", size: "3.8 KB" },
        { name: "PDPLConsentFlow.ts", path: "src/auth/PDPLConsentFlow.ts", type: "file", language: "typescript", size: "2.1 KB" },
      ]},
      { name: "api", path: "src/api", type: "directory", children: [
        { name: "routes.ts", path: "src/api/routes.ts", type: "file", language: "typescript", size: "6.7 KB" },
        { name: "middleware.ts", path: "src/api/middleware.ts", type: "file", language: "typescript", size: "3.2 KB" },
      ]},
      // ... more folders: governance/, context/, tests/
    ]
  },
  { name: "docs", path: "docs", type: "directory", children: [
    { name: "architecture.md", path: "docs/architecture.md", type: "file", language: "markdown", size: "12 KB" },
    { name: "compliance", path: "docs/compliance", type: "directory", children: [
      { name: "PDPL_mapping.md", path: "docs/compliance/PDPL_mapping.md", type: "file", language: "markdown", size: "8.4 KB" },
      { name: "NCA_ECC_controls.md", path: "docs/compliance/NCA_ECC_controls.md", type: "file", language: "markdown", size: "5.6 KB" },
    ]},
  ]},
  { name: ".github", path: ".github", type: "directory", children: [
    { name: "workflows", path: ".github/workflows", type: "directory", children: [
      { name: "ci.yml", path: ".github/workflows/ci.yml", type: "file", language: "yaml", size: "2.8 KB" },
      { name: "security-scan.yml", path: ".github/workflows/security-scan.yml", type: "file", language: "yaml", size: "1.4 KB" },
      { name: "pdpl-compliance.yml", path: ".github/workflows/pdpl-compliance.yml", type: "file", language: "yaml", size: "1.1 KB" },
    ]},
  ]},
  // ... package.json, README.md, etc.
];
```

**Create 15+ commits, 6+ PRs, and a realistic file tree matching a Saudi government digital service project.**

## 1.6 Create `forge/outputArtifacts.ts`

Demo artifacts that showcase what was "built" through Forge:

```typescript
export const outputArtifacts: OutputArtifact[] = [
  {
    id: "artifact-live-1",
    storyId: "forge-story-1",
    projectId: "ndpp",
    title: "Citizen Authentication Portal",
    type: "live-preview",
    description: "Live preview of the citizen authentication flow with Nafath SSO integration",
    previewUrl: "/demo/citizen-auth-preview", // internal route serving an iframe-able React component
    githubUrl: "https://github.com/TheArkitektai/Forge/tree/main/src/auth",
    timestamp: "2 hours ago",
    generatedBy: "Developer",
    phase: "Develop",
  },
  {
    id: "artifact-code-1",
    storyId: "forge-story-1",
    projectId: "ndpp",
    title: "NafathProvider.ts",
    type: "code",
    description: "Identity verification provider implementing Nafath SSO protocol",
    codeSnippet: `import { NafathConfig, VerificationResult } from './types';
import { PDPLConsentManager } from './PDPLConsentFlow';

export class NafathProvider {
  private config: NafathConfig;
  private consentManager: PDPLConsentManager;

  constructor(config: NafathConfig) {
    this.config = config;
    this.consentManager = new PDPLConsentManager(config.pdplPolicy);
  }

  async verifyIdentity(nationalId: string): Promise<VerificationResult> {
    // Step 1: Verify PDPL consent before processing
    const consent = await this.consentManager.checkConsent(nationalId);
    if (!consent.granted) {
      return { verified: false, reason: 'PDPL consent required' };
    }

    // Step 2: Initiate Nafath verification
    const session = await this.initiateSession(nationalId);

    // Step 3: Wait for citizen confirmation via Nafath app
    const result = await this.awaitConfirmation(session.id);

    // Step 4: Record verification in proof chain
    await this.recordProofChainEntry(result);

    return result;
  }
}`,
    language: "typescript",
    githubUrl: "https://github.com/TheArkitektai/Forge/blob/main/src/auth/NafathProvider.ts",
    timestamp: "2 hours ago",
    generatedBy: "AI Agent",
    phase: "Develop",
  },
  {
    id: "artifact-doc-1",
    storyId: "forge-story-1",
    projectId: "ndpp",
    title: "Architecture Impact Assessment",
    type: "document",
    description: "Auto generated architecture impact analysis for Citizen Authentication Service",
    codeSnippet: "## Architecture Impact Assessment\n\n### Story: Citizen Authentication Service\n\n### Impacted Layers\n\n**Layer 1: Customer Interaction**\nNew authentication UI components for Nafath flow.\n\n**Layer 3: Intelligence**\nContext compiler patterns updated for identity verification.\n\n**Layer 5: Data and Context**\nSession storage schema changes in PostgreSQL.\n\n### Risk Assessment\nOverall risk: Low. Pattern reused from 4 previous deployments.\n\n### Evidence\nProof hash: 7f3a2b1c\nApproved by: Sara Malik (Solution Architect)\nDate: April 20, 2026",
    language: "markdown",
    timestamp: "1 day ago",
    generatedBy: "AI Agent",
    phase: "Design",
  },
  // ... api-spec (OpenAPI YAML), test-report, diagram (mermaid), evidence-pack
];
```

**Create 8 to 10 artifacts spanning all types: live-preview, code, document, diagram, api-spec, test-report, evidence-pack. Spread across different stories and phases.**

## 1.7 Create `forge/auditTrail.ts`

```typescript
export const auditEvents: AuditEvent[] = [
  {
    id: "audit-1",
    type: "state-change",
    title: "Story advanced to Design phase",
    detail: "Citizen Authentication Service moved from Plan to Design. All plan gate criteria satisfied.",
    actor: "Sara Malik",
    actorRole: "Delivery Lead",
    timestamp: "April 20, 2026 14:32",
    proofHash: "7f3a2b1c",
    relatedStoryId: "forge-story-1",
    relatedProjectId: "ndpp",
  },
  // ... 20+ events covering state changes, approvals, AI actions, config changes, connector events
];
```

## 1.8 Create `forge/policyRules.ts`

```typescript
export const policyRules: PolicyRule[] = [
  {
    id: "pdpl-data-handling",
    title: "PDPL Personal Data Handling",
    description: "All personal data processing must have documented consent and purpose limitation before code execution",
    category: "Compliance",
    severity: "Blocking",
    enabled: true,
    applicableFrameworks: ["PDPL"],
  },
  {
    id: "nca-ecc-controls",
    title: "NCA Essential Cybersecurity Controls",
    description: "Security controls must be validated against NCA ECC requirements before deployment",
    category: "Security",
    severity: "Blocking",
    enabled: true,
    applicableFrameworks: ["NCA_ECC"],
  },
  // ... 10+ policy rules across Compliance, Security, Quality, Performance categories
];
```

## 1.9 Extend `forge/context.tsx`

Add the following to ForgeContextValue and ForgeProvider:

```typescript
// New state in ForgeProvider:
const [storyTransitions, setStoryTransitions] = useState<StoryTransition[]>([]);
const [approvalActions, setApprovalActions] = useState<ApprovalAction[]>([]);
const [aiAgentStatus, setAiAgentStatus] = useState<AIAgentStatus>("idle");
const [activeAiScript, setActiveAiScript] = useState<AIDemoScript | null>(null);
const [configuredPersonas, setConfiguredPersonas] = useState<PersonaPreset[]>(personaPresets);
const [policyStates, setPolicyStates] = useState<Record<string, { enabled: boolean; severity: PolicySeverity }>>(/* from policyRules */);
const [demoModeActive, setDemoModeActive] = useState(false);
const [currentDemoStep, setCurrentDemoStep] = useState(0);
const [outputArtifactsList, setOutputArtifacts] = useState<OutputArtifact[]>(outputArtifacts);
const [auditTrailEvents, setAuditTrailEvents] = useState<AuditEvent[]>(auditEvents);

// New actions:
const advanceStory = useCallback((storyId: string, toPhase: StoryPhase) => {
  // 1. Update the story's phase in local state
  // 2. Create a StoryTransition record
  // 3. Create an AuditEvent
  // 4. Update proof chain score
  // 5. Show toast notification
}, []);

const approveGovernanceItem = useCallback((itemId: string, action: "approved" | "rejected", reason?: string) => {
  // 1. Update governance item status
  // 2. Create ApprovalAction record
  // 3. Create AuditEvent
  // 4. Update proof chain gauge
  // 5. Show toast notification
}, []);

const triggerAiAgent = useCallback((scriptId: string) => {
  // 1. Set active script
  // 2. Cycle through agent statuses with delays
  // 3. Return the script content for typed text display
}, []);

const createProject = useCallback((name: string, templateKey: ProjectTypeKey, config?: Partial<ProjectTemplate>) => {
  // 1. Create Project in local state from template
  // 2. Create first story in Pending state
  // 3. Create AuditEvent
  // 4. Navigate to new project
}, []);

const createCustomPersona = useCallback((preset: PersonaPreset) => {
  // Add to configuredPersonas
}, []);

const togglePolicy = useCallback((policyId: string) => {
  // Toggle enabled state
}, []);

const updatePolicySeverity = useCallback((policyId: string, severity: PolicySeverity) => {
  // Update severity
}, []);
```

## 1.10 Update Routing (`App.tsx`)

```typescript
// Add these routes:
<Route path="/portfolio">
  <ForgeWorkspace screenKey="portfolio" />
</Route>

<Route path="/output">
  <ForgeWorkspace screenKey="output" />
</Route>
<Route path="/output/:artifactId">
  {(params) => <ForgeWorkspace screenKey="output" routeArtifactId={params.artifactId} />}
</Route>

// Update default route to /portfolio instead of /command:
<Route path="/">
  <ForgeWorkspace screenKey="portfolio" />
</Route>
```

## 1.11 Update `ForgeWorkspace.tsx`

Add portfolio and output screen imports, screenMeta entries, and switch cases.

---

# PHASE 2: PROJECT CREATION AND ONBOARDING

## 2.1 `forge/components/ProjectCreateWizard.tsx`

A modal dialog with two modes:

**Quick Start Mode:**
1. Project name input field
2. Project type grid: 9 cards showing icon, name, description, phase count, governance level
3. One page summary showing auto configured phases, gates, connectors, personas
4. "Launch Project" button with brief animation

**Advanced Setup Mode (6 steps with a stepper):**

Step 1: Identity (name, description, owner, type selection)
Step 2: Workflow (visual phase preview, add/remove phases, gate configuration per transition)
Step 3: Connectors (marketplace grid filtered for this type, toggle on/off, recommended pre selected)
Step 4: Personas (preset grid with checkboxes, custom persona builder button, team assignment)
Step 5: Governance (posture selector: Standard/Enhanced/Maximum, compliance toggles: PDPL/NCA_ECC/SOC2/ISO, evidence level per phase)
Step 6: Review (full summary of all choices, estimated complexity score, Launch button)

Design: use Radix Dialog for the modal. Use Radix Tabs or a custom stepper for the 6 steps. Each step should have a clean card layout matching the design system.

## 2.2 `forge/components/PersonaBuilderDialog.tsx`

A dialog for creating/editing custom personas:

- Name, role title, icon picker (from lucide icon set)
- Dashboard widget selector (checkboxes from DashboardWidget type, drag to reorder)
- Metric priorities (sortable list)
- Notification filters (checkboxes)
- Action permissions (checkboxes)
- Preview panel showing how Command Center would look for this persona

## 2.3 Update `PortfolioScreen.tsx`

Add:
- "Create Project" button in the header area (opens ProjectCreateWizard)
- "Create Tenant" button (opens a simpler dialog: name, region, tier selection)
- Project type badges on each project card
- Compounding value summary strip at the top: total memory events across tenant, pattern reuse rate, compliance coverage %
- Active persona count badge on each project card

---

# PHASE 3: CORE INTERACTIVE FEATURES

## 3.1 `forge/components/AIAgentPanel.tsx`

A slide up drawer at the bottom of Command Center (or right side panel):

**Structure:**
- Header: "Forge AI Agent" with status indicator (colored dot + status text)
- Pre scripted trigger buttons: "Generate Brief", "Architecture Impact", "Governance Check", "Code Review", "Release Readiness"
- Output area with sections that appear one by one
- Tool call badges that appear inline during generation

**Typed text hook (`forge/hooks/useTypedText.ts`):**
```typescript
export function useTypedText(text: string, speed: number = 20, enabled: boolean = true) {
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) { setDisplayed(text); setIsComplete(true); return; }
    setDisplayed("");
    setIsComplete(false);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(interval); setIsComplete(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayed, isComplete };
}
```

**Behavior:**
1. User clicks a trigger button
2. Status cycles: idle > thinking (1s) > compiling context (1.5s) > generating
3. Tool call badges appear one by one during "compiling context"
4. Sections type out one by one during "generating"
5. Confidence score appears at the end with a progress ring animation
6. Status changes to "complete"

## 3.2 Story State Transitions (`DeliveryFlow.tsx` update + `forge/components/StoryTransitionDialog.tsx`)

**Add to each story card in DeliveryFlow:**
- An "Advance" button (right arrow icon) visible on hover
- Clicking opens StoryTransitionDialog

**StoryTransitionDialog:**
- Shows: current phase > next phase with arrow
- Gate requirements checklist (derived from project template)
- Approver selector (auto filled based on gate config)
- Evidence status (proof chain items for this transition)
- "Confirm Transition" button
- On confirm: story card animates to new column, toast notification, audit event created

**Also add:**
- "Create Story" button in Delivery Flow header
- Story card shows transition history (small timeline dots)
- Phase columns adapt to project type (e.g., Data Integration shows Ingest/Transform/Validate/Deploy)
- Blocked state visual: red left border, blocker reason tooltip
- Persona filter button: show only stories relevant to current persona

## 3.3 Approval Workflow (`GovernanceScreen.tsx` update + `forge/components/ApprovalActionDialog.tsx`)

**Add to each governance queue item:**
- "Approve" button (green, CheckCircle2 icon)
- "Reject" button (red, XCircle icon)
- Clicking either opens ApprovalActionDialog

**ApprovalActionDialog:**
- Shows the governance item title and context
- For reject: required reason textarea
- Evidence links section (checkboxes of related artifacts)
- Confirm button
- On confirm: item status updates, proof chain gauge animates, audit event, toast

**Also add to Governance:**
- Compliance dashboard section: PDPL coverage %, NCA ECC alignment %, audit readiness score
- Evidence export button (opens EvidenceExportModal)
- Audit trail panel (expandable section showing chronological AuditEvents)
- Persona aware filtering: show only gates this persona has authority to act on

## 3.4 `forge/components/EvidenceExportModal.tsx`

- Format selector: PDF, JSON, CSV (radio buttons)
- Scope selector: Current Story, Current Project, Full Tenant
- Template selector: PDPL, NCA ECC, SOC2, ISO 27001, NDMO (checkboxes)
- Date range picker
- "Generate Export" button
- Progress bar animation (simulated, 3 seconds)
- Success state with "download" link and last export timestamp

## 3.5 Config Studio FULL REWRITE (`ConfigStudio.tsx`)

Replace entirely with a 5 tab layout using Radix Tabs:

**Tab 1: Connectors (Marketplace)**
- Category filter bar: All, Dev Tools, CI/CD, Enterprise, Communication, Cloud, Compliance, Identity, Storage
- Grid of connector cards (from existing connector data, 26+)
- Each card: icon, name, category, status badge, description
- Status colors: Connected (emerald), Available (sky), Pending setup (amber), Disabled (slate), Coming soon (muted)
- Click Connected > show disconnect confirmation
- Click Available > open ConnectorSetupWizard (3 step: Configure, Authorize, Test Connection)
- Connected cards show: version, last sync, events per day

**`forge/components/ConnectorSetupWizard.tsx`:**
- Step 1: Configuration (API endpoint, credentials placeholder fields)
- Step 2: Authorization (simulated OAuth flow with "Authorize" button)
- Step 3: Test Connection (progress animation, success/failure result)
- On complete: connector status flips to "Connected", audit event

**Tab 2: Workflow (Visual Builder)**
- Canvas area showing workflow nodes connected by lines
- Node types with distinct colors: phase (sky), gate (emerald), connector (amber), policy (rose), memory (violet)
- Click any node > detail panel slides in from right showing name, type, status, connections
- Template preset buttons above canvas: Standard SDLC, Lightweight Agile, Enterprise Governed, Compliance Heavy
- Clicking a template rearranges nodes with animation
- Header shows: X phases, Y gates, Z connectors active

Render nodes using absolute positioned divs with CSS connections (dotted lines via SVG or CSS borders). Use the existing WorkflowNode data with x/y coordinates.

**Tab 3: Policies**
- Grid of PolicyRule cards
- Each card: title, description, category badge, severity selector (Blocking/Advisory/Info dropdown), enable/disable switch
- Category filter: All, Compliance, Security, Quality, Performance
- Changes are immediate in local state

**Tab 4: Memory**
- Retention settings: slider for event retention period (30/60/90/180/365 days)
- Auto archival toggle with frequency selector
- Cross project sharing toggle (when on, memory events visible across all projects in tenant)
- Indexing frequency selector (Real time, Hourly, Daily)
- Memory stats: total events, active patterns, reuse rate

**Tab 5: Personas**
- Grid of configured personas from preset library
- Each card: icon, name, role, enabled/disabled toggle
- "Create Custom Persona" button (opens PersonaBuilderDialog)
- Click any persona card to edit or preview their dashboard layout
- Team assignment section: list of team members with persona dropdown

## 3.6 Context Hub Updates (`ContextHub.tsx`)

Add:
- "Cross Project" toggle button: when active, shows memory events from ALL projects in active tenant (aggregate from all story memory events, add project name badge)
- Memory search input: filter events by keyword in title/detail
- Compounding value metric strip: total events, reuse count, pattern adoption rate
- "Create Memory" button: manual memory event creation dialog (kind, title, detail)
- Memory event cards show: link to related story, project source badge (in cross project mode)

---

# PHASE 4: OUTPUT VIEWER AND GITHUB INTEGRATION

## 4.1 New Screen: `forge/screens/OutputScreen.tsx`

**This is the "what was built" screen.** Add "Output" to the screen navigation (ScreenKey = "output").

**Layout:**
- Left panel (60%): artifact viewer area
- Right panel (40%): artifact list + metadata

**Artifact list (right panel):**
- Filterable by type: All, Live Preview, Code, Document, Diagram, API Spec, Test Report, Evidence Pack
- Filterable by phase: Plan, Design, Develop, Test, Ship
- Each item: title, type badge, phase badge, timestamp, "generated by" label
- Click to load in viewer

**Viewer area (left panel) adapts by artifact type:**

| Type | Viewer |
|------|--------|
| live-preview | iframe rendering a React component (build simple demo preview components for each) |
| code | Syntax highlighted code viewer (use a `<pre>` with Tailwind typography classes or a simple highlight approach) |
| document | Rendered markdown with proper headings and formatting |
| diagram | Mermaid diagram rendered as SVG (or a static SVG image) |
| api-spec | OpenAPI spec rendered as endpoint list with method badges |
| test-report | Test results table with pass/fail badges and coverage percentage |
| evidence-pack | Governance evidence summary with proof hashes and approval chain |

**Key detail panel below viewer:**
- GitHub link (opens real GitHub URL for this artifact)
- Proof chain hash
- Generation history (who created, when, which AI agent if applicable)
- "Open in GitHub" button (external link)
- Related story link (navigates to Delivery Flow with this story selected)

## 4.2 Live Preview Components

Create simple demo preview components that render in iframes within the Output viewer:

**`forge/previews/CitizenAuthPreview.tsx`:**
A simple login page mockup with:
- Nafath logo
- National ID input field
- "Verify with Nafath" button
- Simulated verification flow (button click > loading > success screen with citizen name)
- PDPL consent checkbox
- Arabic/English toggle
- Styled to look like a real government portal

**`forge/previews/HealthPortalPreview.tsx`:**
A simple health portal dashboard with:
- Patient information cards
- Appointment scheduler
- Medical record viewer placeholder

**`forge/previews/TradeLicensePreview.tsx`:**
A trade license application form with:
- Business details form
- Document upload area
- Status tracker

Create 3 to 4 preview components. They should be simple, visually polished single page React components that demonstrate realistic Saudi government digital services.

## 4.3 GitHub Integration Panel

Add a GitHub section to the **Architecture screen** and **Delivery Flow** screen:

**Architecture screen addition:**
- "Repository" collapsible section showing:
  - Repo name with link to GitHub
  - Branch selector dropdown
  - File tree browser (collapsible folders, click file to see GitHub link)
  - Recent commits list (5 most recent for selected branch)

**Delivery Flow addition:**
- On story card detail panel, add "Code" section showing:
  - Latest commits related to this story (filter by branch name matching story)
  - Open PRs for this story
  - CI/CD status badges (from PR checks)
  - "View in GitHub" button

**Command Center addition:**
- "Repository Activity" widget (for DevOps/Developer personas):
  - Open PRs count
  - Commits today count
  - CI pipeline status (last run: passed/failed)
  - Branch count

**Config Studio (Connectors tab) update:**
- GitHub connector card shows: repo connected, last sync, commits synced, PR events per day
- When connected, shows real repo URL

## 4.4 GitHub Webhook Simulation

Add simulated GitHub webhook events to the notification system:

```typescript
const githubNotifications: NotificationItem[] = [
  { id: "gh-1", title: "PR #42 ready for review", detail: "Citizen Authentication Service with Nafath SSO by Omar Rahman", time: "3 minutes ago", tone: "blue" },
  { id: "gh-2", title: "CI pipeline passed on develop", detail: "All 47 tests passed. SonarQube quality gate: passed. PDPL scan: clear", time: "12 minutes ago", tone: "green" },
  { id: "gh-3", title: "New commit on feature/nafath-integration", detail: "feat: implement session management with PDPL consent tracking", time: "2 hours ago", tone: "slate" },
  // ... more events
];
```

These should appear in the notification panel and update when connector status changes.

---

# PHASE 5: END TO END PERSONA JOURNEYS

## 5.1 Guided Demo Mode (`forge/components/DemoModeOverlay.tsx`)

A floating panel that narrates the demo:

**Structure:**
- Fixed position bottom right, 320px wide
- Semi transparent dark background with white text
- Step counter: "Step 3 of 10"
- Current step title and narration text
- "Next" button to advance
- "Previous" button
- "Exit Demo" button
- Persona indicator (shows which persona is active for this step)
- Auto advance toggle (for hands off presentations)

**Define `forge/demoSteps.ts`:**
```typescript
export const unifiedJourneySteps: DemoStep[] = [
  {
    id: "step-1",
    screen: "portfolio",
    title: "The Platform",
    narration: "Welcome to Arkitekt Forge. You are looking at the portfolio view showing all tenants managed by this platform. Each tenant has its own workspace, connectors, and governance posture.",
    persona: "programme-director",
  },
  {
    id: "step-2",
    screen: "portfolio",
    title: "Create a New Project",
    narration: "Let us create a new project. Click Create Project and select Government Digital Service. This auto configures 7 phases, dual approval gates, PDPL compliance, and the Nafath connector.",
    action: "open-create-project",
    persona: "programme-director",
  },
  // ... 10 to 15 steps covering the full unified journey
];

export const ctoDeepDiveSteps: DemoStep[] = [ /* ... */ ];
export const developerDeepDiveSteps: DemoStep[] = [ /* ... */ ];
export const complianceDeepDiveSteps: DemoStep[] = [ /* ... */ ];
```

## 5.2 Persona Adaptive Command Center

The Command Center must render different widget layouts based on active persona:

```typescript
const personaWidgetLayouts: Record<PersonaKey, { main: DashboardWidget[]; sidebar: DashboardWidget[] }> = {
  "cto": {
    main: ["portfolio-kpis", "release-confidence-trend", "compounding-value"],
    sidebar: ["proof-chain-gauge", "governance-queue"],
  },
  "developer": {
    main: ["active-assignments", "context-quality", "ci-pipeline-status"],
    sidebar: ["story-spotlight", "persona-metrics"],
  },
  "compliance-officer": {
    main: ["compliance-dashboard", "governance-queue", "proof-chain-gauge"],
    sidebar: ["evidence-timeline", "policy-status"],
  },
  // ... all 10 personas
};
```

Build each widget as a separate component and compose them in Command Center based on the active persona's layout.

## 5.3 Persona Aware Screens

**Delivery Flow:** Add a "My Stories" toggle that filters to stories assigned to the current persona's role.

**Governance:** Filter the approval queue to show only gates the current persona has authority to act on (based on PersonaPreset.actionPermissions).

**Context Hub:** Reorder memory events based on PersonaPreset.memoryFeedOrder.

**Architecture:** Highlight the architecture layers that the current persona is most responsible for.

---

# PHASE 6: POLISH AND BRANDING

## 6.1 Saudi Market Branding

- Add regulatory badges to relevant screens:
  - "PDPL Compliant" badge (green shield) in Governance header
  - "NCA ECC Aligned" badge in Portfolio platform health
  - "NDMO Ready" badge in Config Studio
- Show "GCP me-central2 (Dammam, Saudi Arabia)" as deployment region in Portfolio
- Use Arabic placeholder text in the live preview components (bilingual labels)
- Add Saudi ministry seal placeholders as tenant icons

## 6.2 Notification System

Wire toast notifications to all state changing actions:
- Story transitions: "Story moved to Design. View in Delivery Flow."
- Approvals: "Compliance gate approved by Dana Youssef."
- AI completions: "Brief generation complete. 94% confidence."
- Connector events: "GitHub connected successfully. 42 commits synced."
- Evidence exports: "PDPL evidence pack generated. Download ready."

Use the existing `sonner` toast library.

## 6.3 Animation and Loading States

- Story cards animate smoothly when changing columns (framer-motion layoutId)
- Proof chain gauge animates when value changes (recharts animation)
- Connector status badges animate on status change (scale + color transition)
- AI agent panel slides up from bottom with spring animation
- Wizard steps transition with horizontal slide
- Skeleton loading states on all data panels during screen transitions

## 6.4 Responsive Layout

Verify all screens work on iPad Pro (1024x1366) as this is common in client meetings. The sidebar should collapse to icons, and the main content area should stack vertically on smaller screens.

---

# FILE CREATION CHECKLIST

## New files to create:

```
forge/
├── projectTemplates.ts          # 9 project type definitions
├── personaPresets.ts            # 10 persona definitions
├── demoScripts.ts               # 6 AI agent pre-scripted responses
├── githubData.ts                # GitHub commits, PRs, file tree, repo config
├── outputArtifacts.ts           # 10 demo artifacts
├── auditTrail.ts                # 20+ audit events
├── policyRules.ts               # 12+ policy rules
├── demoSteps.ts                 # Demo mode step definitions
├── hooks/
│   └── useTypedText.ts          # Character-by-character animation hook
├── components/
│   ├── ProjectCreateWizard.tsx  # Quick Start + Advanced Setup (6 steps)
│   ├── PersonaBuilderDialog.tsx # Custom persona creation/editing
│   ├── AIAgentPanel.tsx         # AI simulation drawer with typed text
│   ├── ConnectorMarketplace.tsx # Filterable connector grid
│   ├── ConnectorSetupWizard.tsx # 3 step connection flow
│   ├── WorkflowBuilder.tsx      # Visual node canvas with templates
│   ├── StoryTransitionDialog.tsx # Gate confirmation for phase changes
│   ├── StoryCreateDialog.tsx    # New story form
│   ├── ApprovalActionDialog.tsx # Approve/reject with evidence
│   ├── EvidenceExportModal.tsx  # Export format/scope/template
│   ├── AuditTrailPanel.tsx      # Chronological event log
│   ├── CompoundingValuePanel.tsx # Value metrics and trend chart
│   ├── GitHubPanel.tsx          # Repo, commits, PRs, file tree
│   ├── OutputViewer.tsx         # Artifact viewer (code, preview, doc)
│   ├── DemoModeOverlay.tsx      # Guided demo narration
│   └── MemoryTimeline.tsx       # Horizontal timeline view
├── screens/
│   └── OutputScreen.tsx         # New "Output" screen
└── previews/
    ├── CitizenAuthPreview.tsx   # Live preview: auth portal
    ├── HealthPortalPreview.tsx  # Live preview: health dashboard
    └── TradeLicensePreview.tsx  # Live preview: license application
```

## Files to modify:

```
forge/types.ts         # Add all new types from Phase 1.1
forge/data.ts          # Add project type to Project, update existing data
forge/context.tsx      # Add all new state and actions from Phase 1.9
forge/ForgeLayout.tsx  # Add Output to nav, update breadcrumbs, persona count
forge/ForgeWorkspace.tsx # Add Output screen, portfolio route fix, screenMeta updates
App.tsx                # Add /portfolio, /output routes, update default
forge/screens/
  PortfolioScreen.tsx    # Add Create buttons, project type badges, value strip
  CommandCenter.tsx      # Add AI panel, persona adaptive layout, compounding value
  DeliveryFlow.tsx       # Add transitions, create story, persona filter, type aware phases
  ContextHub.tsx         # Add cross project, search, create memory, compounding metrics
  ArchitectureScreen.tsx # Add GitHub panel, interactive diagram, dependency view
  GovernanceScreen.tsx   # Add inline approvals, evidence export, audit trail, compliance dashboard
  ConfigStudio.tsx       # FULL REWRITE: 5 tabs (connectors, workflow, policies, memory, personas)
```

---

# BUILD ORDER

Execute in this exact sequence. Each phase builds on the previous.

1. **Phase 1**: All data files first (types, templates, presets, scripts, seeds). Then context.tsx extensions. Then routing fixes. **Test: app compiles, all existing screens still render.**

2. **Phase 2**: ProjectCreateWizard, PersonaBuilderDialog, Portfolio updates. **Test: can create a project using Quick Start, can see project type badges.**

3. **Phase 3**: AI Agent panel, story transitions, approval workflow, Config Studio rewrite, Context Hub updates, evidence export. **Test: can run the unified journey from Act 1 through Act 6.**

4. **Phase 4**: Output screen, GitHub integration, live previews, artifact viewer. **Test: can view code, documents, and live previews in the Output screen. GitHub commits and PRs appear.**

5. **Phase 5**: Demo mode overlay, persona adaptive layouts, persona aware filtering across all screens. **Test: demo mode narration works end to end. Switching personas changes Command Center layout.**

6. **Phase 6**: Saudi branding, notification wiring, animation polish, responsive verification. **Test: full demo runs smoothly on desktop and iPad.**

---

# CRITICAL RULES

1. **No backend calls.** Everything is local state and seed data.
2. **No dashes** in any UI text, labels, descriptions, or copy. Use colons, commas, or restructure the sentence.
3. **Match the design system exactly.** Use the card styles, font classes, and color patterns from existing screens.
4. **Use existing UI components.** The project has 50+ shadcn/Radix components ready to use (Dialog, Tabs, Switch, Popover, Select, etc.).
5. **Use framer-motion** for all animations (already installed).
6. **Use recharts** for all charts (already installed).
7. **Use wouter** for routing (already installed, NOT react-router).
8. **Use lucide-react** for all icons (already installed).
9. **Test after each phase.** The app must compile and render correctly before moving to the next phase.
10. **GitHub repo is `https://github.com/TheArkitektai/Forge.git`**. All GitHub URLs in the UI must use this repo. The constants `GITHUB_ORG`, `GITHUB_REPO`, and `GITHUB_BASE_URL` in `forge/githubData.ts` are the single source of truth.

---

# GITHUB REPO SCAFFOLD

Before building the Forge UI, set up the GitHub repo (`TheArkitektai/Forge`) with a realistic project structure that the demo will reference. Push the following scaffold:

```
Forge/
├── README.md                          # Project overview matching demo narrative
├── package.json                       # Node.js project config
├── tsconfig.json
├── src/
│   ├── auth/
│   │   ├── NafathProvider.ts          # Nafath SSO identity verification
│   │   ├── SessionManager.ts          # Session management with PDPL consent
│   │   ├── PDPLConsentFlow.ts         # Personal data consent handling
│   │   └── types.ts                   # Auth type definitions
│   ├── api/
│   │   ├── routes.ts                  # API route definitions
│   │   ├── middleware.ts              # RBAC, rate limiting, audit logging
│   │   └── validators.ts             # Request validation schemas
│   ├── governance/
│   │   ├── ProofChain.ts             # Immutable proof chain implementation
│   │   ├── GateExecutor.ts           # Approval gate enforcement
│   │   └── ComplianceMapper.ts       # PDPL and NCA ECC control mapping
│   ├── context/
│   │   ├── ContextCompiler.ts        # Cross project context assembly
│   │   ├── MemoryManager.ts          # Institutional memory CRUD
│   │   └── PatternMatcher.ts         # Reusable pattern detection
│   └── workflow/
│       ├── StateMachine.ts           # 17 state Kanban engine
│       ├── WorkflowRuntime.ts        # Parameterised workflow execution
│       └── TransitionValidator.ts    # Entry/exit criteria enforcement
├── docs/
│   ├── architecture.md               # Architecture overview matching v11
│   ├── compliance/
│   │   ├── PDPL_mapping.md           # PDPL control mapping document
│   │   ├── NCA_ECC_controls.md       # NCA ECC alignment document
│   │   └── evidence_pack_template.md # Evidence pack structure
│   └── api/
│       └── openapi.yaml              # OpenAPI 3.0 spec for Forge API
├── tests/
│   ├── auth/
│   │   └── NafathProvider.test.ts
│   ├── governance/
│   │   └── ProofChain.test.ts
│   └── workflow/
│       └── StateMachine.test.ts
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Build, test, lint pipeline
│       ├── security-scan.yml         # Dependency and code security scan
│       └── pdpl-compliance.yml       # PDPL compliance check workflow
└── infrastructure/
    ├── kubernetes/
    │   ├── deployment.yaml
    │   └── service.yaml
    └── terraform/
        └── gcp-me-central2.tf        # GCP Dammam region config
```

Each source file should contain realistic TypeScript code (100 to 300 lines) with proper imports, classes, interfaces, and JSDoc comments. The code should reference Forge concepts: proof chain, governance gates, PDPL compliance, Context Hub, and the 17 state machine.

Create at least 5 branches with realistic names and push them:
- `main` (production)
- `develop` (integration)
- `feature/citizen-auth` (active feature matching demo story)
- `feature/nafath-integration` (merged feature)
- `release/24.4` (release branch)

Create at least 3 pull requests:
- PR #1: "feat: Citizen Authentication Service with Nafath SSO" (open, from feature/citizen-auth to develop)
- PR #2: "feat: PDPL consent flow implementation" (merged)
- PR #3: "fix: Session timeout handling for Nafath verification" (open, review requested)

Make 15 to 20 commits across branches with realistic commit messages from different authors (Omar Rahman, Sara Malik, Dana Youssef, Leen Haddad, Adel Sami).

This gives the demo real GitHub data to pull from. Every commit hash, PR link, and file path shown in Forge will open to real content in this repo.
