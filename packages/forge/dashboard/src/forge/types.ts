export type ScreenKey =
  | "portfolio"
  | "command"
  | "delivery"
  | "context"
  | "architecture"
  | "governance"
  | "config"
  | "output"
  | "operate";

export type PersonaKey =
  | "cto"
  | "lead"
  | "architect"
  | "developer"
  | "governance"
  | "delivery-lead"
  | "solution-architect"
  | "qa-lead"
  | "security-officer"
  | "compliance-officer"
  | "product-owner"
  | "devops-lead"
  | "programme-director"
  | string;

export type StoryPhase = "Plan" | "Design" | "Develop" | "Test" | "Ship" | "Operate";

export type ProductionHealth = {
  status: "healthy" | "degraded" | "down";
  deployedAt: string;
  version: string;
  sloCompliance: number;
  errorRate: number;
  errorRateTrend: number[];
  activeIncidentCount: number;
  lastIncidentAt?: string;
  deploymentHistory: {
    version: string;
    deployedAt: string;
    status: "success" | "rollback" | "failed";
  }[];
};

export type RiskLevel = "Low" | "Medium" | "High";

export type ModuleKey =
  | "contextCompiler"
  | "proofValidator"
  | "policyEngine"
  | "externalConnectors"
  | "codeExecutionLoop"
  | "operateModule"
  | "ideIntegration";

export type MetricTone = "blue" | "green" | "slate" | "amber";

export type NavScreen = {
  key: ScreenKey;
  label: string;
  shortLabel: string;
};

export type PersonaDefinition = {
  key: PersonaKey;
  label: string;
  shortLabel: string;
  role: string;
  sidebarSummary: string;
  commandSummary: string;
};

export type StoryPhaseState = {
  phase: StoryPhase;
  status: "ready" | "active" | "watch";
  title: string;
  note: string;
};

export type MemoryEvent = {
  id: string;
  kind: "Pattern reuse" | "Evidence reuse" | "Lesson learned" | "Context link";
  title: string;
  detail: string;
  time: string;
};

export type ServiceImpact = {
  id: string;
  name: string;
  layer: string;
  status: string;
  detail: string;
};

export type GovernanceItem = {
  id: string;
  title: string;
  status: "Ready" | "Reviewing" | "Needs action" | "Approved";
  owner: string;
  time: string;
  storyId?: string;
  storyTitle?: string;
  artifactId?: string;
  artifactTitle?: string;
  phaseContext?: string;
};

export type ControlItem = {
  id: string;
  title: string;
  status: "Healthy" | "Watch" | "Blocked";
  detail: string;
};

export type AgentOutputSectionType =
  | "brief"
  | "design_flow"
  | "component_diagram"
  | "wireframe"
  | "code_summary"
  | "test_results"
  | "security_scan"
  | "deploy_checklist"
  | "release_notes"
  | "architecture_impact";

export type AgentOutputStatus = "draft" | "awaiting_review" | "approved" | "reworked";

export type AgentOutputSection = {
  title: string;
  type: AgentOutputSectionType;
  content: string;
  items?: string[];
  status: AgentOutputStatus;
  agentName: string;
  reviewedBy?: string;
};

export type StoryPhaseOutput = {
  sections: AgentOutputSection[];
};

export type StoryFeedbackEntry = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  phase: StoryPhase;
  type: "feedback" | "rejection" | "approval";
};

export type AcceptanceCriterion = {
  id: string;
  text: string;
  met: boolean;
};

export type Story = {
  id: string;
  title: string;
  phase: StoryPhase;
  owner: string;
  ownerRole: string;
  risk: RiskLevel;
  confidence: number;
  memoryLinks: number;
  evidenceScore: number;
  summary: string;
  nextGate: string;
  services: string[];
  dependencies: string[];
  personaFocus: Record<PersonaKey, string>;
  personaActions: Record<PersonaKey, string[]>;
  phaseStates: StoryPhaseState[];
  memoryEvents: MemoryEvent[];
  serviceImpacts: ServiceImpact[];
  governanceQueue: GovernanceItem[];
  controls: ControlItem[];
  rationale: string[];
  configNotes: string[];
  description?: string;
  acceptanceCriteria?: AcceptanceCriterion[];
  agentOutputs?: Partial<Record<StoryPhase, StoryPhaseOutput>>;
  feedbackHistory?: StoryFeedbackEntry[];
  productionHealth?: ProductionHealth;
};

export type ModuleDefinition = {
  key: ModuleKey;
  title: string;
  note: string;
  dependencyLabel: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: MetricTone;
  actionUrl?: string;
};

export type SearchResult = {
  id: string;
  title: string;
  detail: string;
  category: "Screen" | "Story" | "Approval" | "Module";
  screen: ScreenKey;
  storyId?: string;
};

export type MetricCard = {
  label: string;
  value: string;
  note: string;
  tone: MetricTone;
};

export type SelectOption = {
  label: string;
  value: string;
};

/* ── Multi tenant and multi project ── */

export type TenantTier = "Sovereign" | "Enterprise" | "Team";

export type Tenant = {
  id: string;
  name: string;
  region: string;
  tier: TenantTier;
  projectCount: number;
  connectorCount: number;
  memoryArtifacts: number;
  activeRelease: string;
  health: "Healthy" | "Watch" | "At risk";
};

export type Project = {
  id: string;
  tenantId: string;
  name: string;
  release: string;
  phase: StoryPhase;
  storyCount: number;
  confidence: number;
  memoryLinks: number;
  owner: string;
  status: "Active" | "Planning" | "Completed" | "On hold";
};

/* ── Connectors and plug and play config ── */

export type ConnectorCategory =
  | "Dev Tools"
  | "CI/CD"
  | "Enterprise"
  | "Communication"
  | "Cloud"
  | "Compliance"
  | "Identity"
  | "Storage";

export type ConnectorStatus =
  | "Connected"
  | "Available"
  | "Pending setup"
  | "Disabled"
  | "Coming soon";

export type Connector = {
  id: string;
  name: string;
  category: ConnectorCategory;
  status: ConnectorStatus;
  description: string;
  dataFlow: string;
  icon: string;
  version?: string;
  lastSync?: string;
  eventsPerDay?: number;
  direction?: ConnectorDirection;
  actions?: ConnectorAction[];
};

export type WorkflowNode = {
  id: string;
  label: string;
  kind: "phase" | "gate" | "connector" | "policy" | "memory";
  status: "active" | "configured" | "available";
  x: number;
  y: number;
  connectedTo: string[];
};

export type ConfigTab = "connectors" | "workflow" | "policies" | "memory" | "personas";

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
  | "ai-accelerated"
  | "custom";

export type ProjectTemplate = {
  key: ProjectTypeKey;
  name: string;
  description: string;
  icon: string;
  category: "Engineering" | "Saudi Market" | "Custom";
  phases: { id: string; name: string; states: string[] }[];
  defaultGates: { fromPhase: string; toPhase: string; approvers: number; roles: string[] }[];
  recommendedConnectors: string[];
  recommendedPersonas: PersonaKey[];
  governancePosture: "Standard" | "Enhanced" | "Maximum";
  complianceDefaults: string[];
};

/* ── Extended Persona System ── */

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
  | "cross-project-dependencies"
  | "execution-loop-status"
  | "context-budget-gauge"
  | "operate-incidents"
  | "ide-connections"
  | "explainability-score";

export type PersonaPreset = {
  key: PersonaKey;
  name: string;
  shortLabel: string;
  role: string;
  icon: string;
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

export type AIAgentStatus = "idle" | "thinking" | "compiling-context" | "generating" | "complete" | "generating-code" | "testing" | "iterating" | "awaiting-review";

export type AIToolCall = {
  tool: string;
  status: "running" | "complete";
  duration: string;
};

export type AIDemoScript = {
  id: string;
  title: string;
  trigger: string;
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
  url: string;
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
  previewUrl?: string;
  codeSnippet?: string;
  language?: string;
  fileTree?: GitHubFileNode[];
  githubUrl?: string;
  timestamp: string;
  generatedBy: string;
  phase: StoryPhase;
  previewComponent?: "citizen_auth" | "permit_dashboard";
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

/* ── Extended Project and Tenant ── */

export type GovernancePosture = "Standard" | "Enhanced" | "Maximum";

/* ── Design Artifacts ── */

export type DesignArtifactType = "user_flow" | "component_diagram" | "wireframe" | "api_contract" | "data_model";

export type DesignArtifact = {
  id: string;
  storyId: string;
  storyTitle: string;
  title: string;
  type: DesignArtifactType;
  status: "draft" | "in_review" | "approved" | "rejected" | "reworked";
  createdBy: string;
  reviewedBy?: string;
  impactedLayers: string[];
  impactedServices: string[];
  content: {
    description: string;
    steps?: Array<{ id: string; label: string; description: string }>;
    components?: Array<{ name: string; description: string; connections: string[] }>;
    fields?: Array<{ name: string; type: string; required: boolean }>;
    endpoints?: Array<{ method: string; path: string; description: string }>;
  };
  feedback: Array<{
    id: string;
    author: string;
    text: string;
    timestamp: string;
    resolved: boolean;
  }>;
  version: number;
  linkedApprovalId?: string;
};

export type WorkflowTemplateKey = "standard_sdlc" | "lightweight_agile" | "enterprise_governed" | "compliance_heavy";

/* ── v12: Code Execution Loop ── */

export type ExecutionStatus =
  | "idle"
  | "generating"
  | "testing"
  | "iterating"
  | "awaiting_review"
  | "merged"
  | "failed"
  | "escalated";

export type ExecutionIteration = {
  id: string;
  iteration: number;
  action: "generate" | "test" | "fix" | "escalate";
  status: "success" | "failure" | "partial";
  summary: string;
  filesChanged: number;
  testsPassed: number;
  testsFailed: number;
  tokensUsed: number;
  durationMs: number;
  timestamp: string;
};

export type CodeExecutionRun = {
  id: string;
  storyId: string;
  storyTitle: string;
  designArtifactId: string;
  status: ExecutionStatus;
  iterations: ExecutionIteration[];
  maxIterations: number;
  currentIteration: number;
  tokenBudget: number;
  tokensUsed: number;
  sandboxId: string;
  branch: string;
  prNumber?: number;
  prUrl?: string;
  explainabilityReport?: ExplainabilityReport;
  startedAt: string;
  completedAt?: string;
  escalationReason?: string;
};

export type ExplainabilityReport = {
  id: string;
  executionRunId: string;
  summary: string;
  designDecisions: { decision: string; rationale: string }[];
  filesCreated: string[];
  filesModified: string[];
  testsCoverage: number;
  governanceChecks: { check: string; result: "pass" | "fail" | "skipped" }[];
  contextBudgetUsage: ContextBudgetAllocation;
  confidenceScore: number;
  timestamp: string;
};

export type ContextBudgetAllocation = {
  total: number;
  used: number;
  breakdown: {
    designArtifact: { allocated: number; used: number };
    codebaseUnderstanding: { allocated: number; used: number };
    relatedPatterns: { allocated: number; used: number };
    governanceRules: { allocated: number; used: number };
  };
};

/* ── v12: Operate Phase ── */

export type OperateEventSeverity = "critical" | "warning" | "info" | "resolved";

export type OperateEvent = {
  id: string;
  projectId: string;
  title: string;
  severity: OperateEventSeverity;
  status: "active" | "investigating" | "mitigating" | "resolved" | "learning_captured";
  source: string;
  detectedAt: string;
  resolvedAt?: string;
  affectedServices: string[];
  correlatedStoryId?: string;
  rootCause?: string;
  remediation?: string;
  lessonLearned?: string;
  assignedTo?: string;
  timelineEvents: {
    timestamp: string;
    action: string;
    actor: string;
  }[];
};

export type OperateMetrics = {
  activeIncidents: number;
  mttr: string;
  uptimePercent: number;
  incidentsThisWeek: number;
  lessonsCaptures: number;
  serviceHealthMap: {
    service: string;
    status: "healthy" | "degraded" | "down";
    lastIncident?: string;
  }[];
};

/* ── v12: IDE Integration ── */

export type IDEProvider = "vscode" | "jetbrains" | "neovim" | "cursor";

export type IDEConnection = {
  id: string;
  provider: IDEProvider;
  status: "connected" | "disconnected" | "syncing";
  lastSync?: string;
  activeFile?: string;
  activeBranch?: string;
  capabilities: ("context_injection" | "gate_approval" | "inline_governance" | "memory_sidebar")[];
  userId: string;
};

/* ── v12: Bidirectional Connectors ── */

export type ConnectorDirection = "read_only" | "bidirectional";

export type ConnectorAction = {
  id: string;
  connectorId: string;
  action: string;
  description: string;
  requiresApproval: boolean;
  governanceGate?: string;
  lastExecuted?: string;
  executionCount: number;
};

/* ── v12: Agent Tools (expanded) ── */

export type AgentToolName =
  | "read_context"
  | "write_artifact"
  | "search_memory"
  | "validate_proof"
  | "transition_state"
  | "assess_risk"
  | "execute_code"
  | "connector_action"
  | "explain_reasoning";
