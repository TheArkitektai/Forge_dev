import type {
  Connector,
  MetricCard,
  ModuleDefinition,
  NavScreen,
  NotificationItem,
  PersonaDefinition,
  PersonaKey,
  Project,
  ScreenKey,
  SearchResult,
  Story,
  Tenant,
  WorkflowNode,
} from "@/forge/types";

export const screens: NavScreen[] = [
  { key: "portfolio", label: "Portfolio", shortLabel: "Portfolio" },
  { key: "command", label: "Command Center", shortLabel: "Command" },
  { key: "delivery", label: "Delivery Flow", shortLabel: "Delivery" },
  { key: "context", label: "Context Hub", shortLabel: "Context" },
  { key: "architecture", label: "Architecture", shortLabel: "Architecture" },
  { key: "governance", label: "Governance", shortLabel: "Governance" },
  { key: "config", label: "Config Studio", shortLabel: "Config" },
  { key: "output", label: "Output", shortLabel: "Output" },

];

/* ── Tenants ── */

export const tenants: Tenant[] = [
  {
    id: "moi",
    name: "Ministry of Interior",
    region: "Saudi Arabia (me-central2)",
    tier: "Sovereign",
    projectCount: 3,
    connectorCount: 12,
    memoryArtifacts: 1284,
    activeRelease: "Release 24.4",
    health: "Healthy",
  },
  {
    id: "moh",
    name: "Ministry of Health",
    region: "Saudi Arabia (me-central2)",
    tier: "Enterprise",
    projectCount: 2,
    connectorCount: 8,
    memoryArtifacts: 743,
    activeRelease: "Release 3.1",
    health: "Watch",
  },
  {
    id: "moc",
    name: "Ministry of Commerce",
    region: "Saudi Arabia (me-central2)",
    tier: "Enterprise",
    projectCount: 1,
    connectorCount: 6,
    memoryArtifacts: 312,
    activeRelease: "Release 1.0",
    health: "Healthy",
  },
  {
    id: "neom",
    name: "NEOM Tech",
    region: "Saudi Arabia (me-central2)",
    tier: "Sovereign",
    projectCount: 4,
    connectorCount: 15,
    memoryArtifacts: 2108,
    activeRelease: "Release 6.2",
    health: "Healthy",
  },
];

/* ── Projects ── */

export const projects: Project[] = [
  {
    id: "ndpp",
    tenantId: "moi",
    name: "National Digital Permits Platform",
    release: "Release 24.4",
    phase: "Operate",
    storyCount: 8,
    confidence: 94,
    memoryLinks: 142,
    owner: "Sara Malik",
    status: "Active",
  },
  {
    id: "citizen-id",
    tenantId: "moi",
    name: "Citizen Identity Gateway",
    release: "Release 2.1",
    phase: "Develop",
    storyCount: 5,
    confidence: 89,
    memoryLinks: 67,
    owner: "Omar Rahman",
    status: "Active",
  },
  {
    id: "border-mgmt",
    tenantId: "moi",
    name: "Border Management Modernization",
    release: "Release 1.3",
    phase: "Plan",
    storyCount: 3,
    confidence: 78,
    memoryLinks: 23,
    owner: "Dana Youssef",
    status: "Planning",
  },
  {
    id: "health-portal",
    tenantId: "moh",
    name: "Citizen Health Portal",
    release: "Release 3.1",
    phase: "Test",
    storyCount: 6,
    confidence: 91,
    memoryLinks: 98,
    owner: "Leen Haddad",
    status: "Active",
  },
  {
    id: "claims-engine",
    tenantId: "moh",
    name: "Health Claims Processing Engine",
    release: "Release 2.0",
    phase: "Ship",
    storyCount: 4,
    confidence: 97,
    memoryLinks: 56,
    owner: "Rayan Fares",
    status: "Active",
  },
  {
    id: "trade-license",
    tenantId: "moc",
    name: "Trade License Automation",
    release: "Release 1.0",
    phase: "Design",
    storyCount: 7,
    confidence: 82,
    memoryLinks: 34,
    owner: "Yara Adel",
    status: "Active",
  },
  {
    id: "neom-iport",
    tenantId: "neom",
    name: "iPORT Digital Delivery",
    release: "Release 6.2",
    phase: "Develop",
    storyCount: 11,
    confidence: 88,
    memoryLinks: 215,
    owner: "Adel Sami",
    status: "Active",
  },
  {
    id: "neom-city-os",
    tenantId: "neom",
    name: "City OS Integration Layer",
    release: "Release 4.0",
    phase: "Design",
    storyCount: 9,
    confidence: 85,
    memoryLinks: 178,
    owner: "Maha Noor",
    status: "Active",
  },
];

/* ── Connectors ── */

export const connectors: Connector[] = [
  { id: "github", name: "GitHub", category: "Dev Tools", status: "Connected", description: "Code repos, pull requests, and commit history flow into story context and proof chain.", dataFlow: "Bi-directional sync", icon: "GH", version: "v3.2", lastSync: "2 minutes ago", eventsPerDay: 340, direction: "bidirectional", actions: [
    { id: "act-gh-1", connectorId: "github", action: "Create pull request", description: "Auto create PR from execution loop branch", requiresApproval: true, governanceGate: "Code Review Gate", executionCount: 12 },
    { id: "act-gh-2", connectorId: "github", action: "Merge pull request", description: "Merge approved PR after governance checks", requiresApproval: true, governanceGate: "Proof Gate", executionCount: 8 },
    { id: "act-gh-3", connectorId: "github", action: "Trigger CI workflow", description: "Run CI pipeline on branch or PR", requiresApproval: false, lastExecuted: "2024-03-20T08:00:00Z", executionCount: 45 },
  ]},
  { id: "jira", name: "Jira", category: "Dev Tools", status: "Connected", description: "Issues, sprints, and backlog items map to governed stories with automatic status sync.", dataFlow: "Bi-directional sync", icon: "JR", version: "v2.8", lastSync: "5 minutes ago", eventsPerDay: 218, direction: "bidirectional", actions: [
    { id: "act-jira-1", connectorId: "jira", action: "Create ticket", description: "Create bug or task ticket from incident", requiresApproval: false, lastExecuted: "2024-03-19T14:45:00Z", executionCount: 6 },
    { id: "act-jira-2", connectorId: "jira", action: "Update ticket status", description: "Sync story phase to Jira status", requiresApproval: false, executionCount: 34 },
  ]},
  { id: "azure-devops", name: "Azure DevOps", category: "Dev Tools", status: "Available", description: "Work items, boards, and repos integrate into the delivery flow and evidence pipeline.", dataFlow: "Bi-directional sync", icon: "AD", },
  { id: "gitlab", name: "GitLab", category: "Dev Tools", status: "Available", description: "Merge requests, pipelines, and code review feed into story context and governance trace.", dataFlow: "Bi-directional sync", icon: "GL", },
  { id: "github-actions", name: "GitHub Actions", category: "CI/CD", status: "Connected", description: "Workflow runs, build artifacts, and deployment events become proof chain evidence.", dataFlow: "Inbound events", icon: "GA", version: "v1.4", lastSync: "8 minutes ago", eventsPerDay: 156 },
  { id: "jenkins", name: "Jenkins", category: "CI/CD", status: "Pending setup", description: "Build pipelines and test results feed into the Test phase and release evidence.", dataFlow: "Inbound events", icon: "JK", },
  { id: "argocd", name: "ArgoCD", category: "CI/CD", status: "Available", description: "Deployment sync and rollback events become governed release transitions.", dataFlow: "Inbound events", icon: "AR", },
  { id: "sonarqube", name: "SonarQube", category: "CI/CD", status: "Connected", description: "Code quality gates feed directly into the proof chain and release readiness score.", dataFlow: "Inbound events", icon: "SQ", version: "v2.1", lastSync: "1 hour ago", eventsPerDay: 42 },
  { id: "servicenow", name: "ServiceNow", category: "Enterprise", status: "Connected", description: "Change requests, incidents, and CMDB sync into governance controls and release records.", dataFlow: "Bi-directional sync", icon: "SN", version: "v3.0", lastSync: "15 minutes ago", eventsPerDay: 89, direction: "bidirectional", actions: [
    { id: "act-sn-1", connectorId: "servicenow", action: "Create change request", description: "Auto create change request for deployment", requiresApproval: true, governanceGate: "Ship Gate", executionCount: 5 },
    { id: "act-sn-2", connectorId: "servicenow", action: "Update incident", description: "Sync Operate incident to ServiceNow", requiresApproval: false, executionCount: 2 },
  ]},
  { id: "sap", name: "SAP S/4HANA", category: "Enterprise", status: "Pending setup", description: "Business process data and compliance controls feed into the platform governance layer.", dataFlow: "Inbound events", icon: "SP", },
  { id: "salesforce", name: "Salesforce", category: "Enterprise", status: "Available", description: "Customer context and deal stage data enrich project memory and priority scoring.", dataFlow: "Inbound events", icon: "SF", },
  { id: "dynamics", name: "Microsoft Dynamics", category: "Enterprise", status: "Coming soon", description: "ERP and CRM events will flow into the operating model for business context enrichment.", dataFlow: "Planned", icon: "DY", },
  { id: "slack", name: "Slack", category: "Communication", status: "Connected", description: "Approval notifications, governance alerts, and story updates push to team channels.", dataFlow: "Outbound events", icon: "SL", version: "v2.5", lastSync: "1 minute ago", eventsPerDay: 127 },
  { id: "teams", name: "Microsoft Teams", category: "Communication", status: "Available", description: "Approval workflows, gate decisions, and release events surface in Teams channels.", dataFlow: "Outbound events", icon: "TM", },
  { id: "email", name: "Email (SMTP/Exchange)", category: "Communication", status: "Connected", description: "Governance decisions, sponsor reviews, and release records are delivered by email.", dataFlow: "Outbound events", icon: "EM", version: "v1.2", lastSync: "3 minutes ago", eventsPerDay: 34 },
  { id: "gcp", name: "Google Cloud Platform", category: "Cloud", status: "Connected", description: "Infrastructure events, deployment logs, and resource state flow into the release evidence.", dataFlow: "Bi-directional sync", icon: "GC", version: "v4.1", lastSync: "Real time", eventsPerDay: 512, direction: "bidirectional", actions: [
    { id: "act-gcp-1", connectorId: "gcp", action: "Restart pod", description: "Restart affected service pod", requiresApproval: true, governanceGate: "Operate Gate", executionCount: 3 },
    { id: "act-gcp-2", connectorId: "gcp", action: "Scale service", description: "Scale service replicas horizontally", requiresApproval: true, governanceGate: "Operate Gate", executionCount: 1 },
  ]},
  { id: "aws", name: "Amazon Web Services", category: "Cloud", status: "Available", description: "CloudTrail, CodePipeline, and deployment events integrate into release proof.", dataFlow: "Inbound events", icon: "AW", },
  { id: "azure", name: "Microsoft Azure", category: "Cloud", status: "Available", description: "Resource Manager events and DevOps pipelines connect into the operating model.", dataFlow: "Bi-directional sync", icon: "AZ", },
  { id: "pdpl-scanner", name: "PDPL Compliance Scanner", category: "Compliance", status: "Connected", description: "Personal data handling checks run automatically and feed into the governance controls.", dataFlow: "Inbound events", icon: "PD", version: "v1.8", lastSync: "30 minutes ago", eventsPerDay: 67 },
  { id: "nca-ecc", name: "NCA ECC Mapper", category: "Compliance", status: "Connected", description: "Essential Cybersecurity Controls mapping ensures every release meets NCA requirements.", dataFlow: "Inbound events", icon: "NC", version: "v1.3", lastSync: "1 hour ago", eventsPerDay: 23 },
  { id: "iso-mapper", name: "ISO 27001 Mapper", category: "Compliance", status: "Available", description: "Map delivery controls to ISO 27001 clauses for international compliance reporting.", dataFlow: "Inbound events", icon: "IS", },
  { id: "nafath", name: "Nafath (National SSO)", category: "Identity", status: "Connected", description: "Citizen identity verification through Saudi national single sign on for citizen facing services.", dataFlow: "Bi-directional sync", icon: "NF", version: "v2.0", lastSync: "Real time", eventsPerDay: 890 },
  { id: "absher", name: "Absher Integration", category: "Identity", status: "Pending setup", description: "Government services portal integration for identity and status verification.", dataFlow: "Bi-directional sync", icon: "AB", },
  { id: "sharepoint", name: "SharePoint", category: "Storage", status: "Connected", description: "Design documents, approval records, and release evidence sync to SharePoint libraries.", dataFlow: "Bi-directional sync", icon: "SH", version: "v2.4", lastSync: "10 minutes ago", eventsPerDay: 45 },
  { id: "gdrive", name: "Google Drive", category: "Storage", status: "Available", description: "Documentation, design artifacts, and exported evidence packs sync to team drives.", dataFlow: "Bi-directional sync", icon: "GD", },
  { id: "confluence", name: "Confluence", category: "Storage", status: "Available", description: "Architecture decisions, runbooks, and knowledge articles stay linked to project memory.", dataFlow: "Bi-directional sync", icon: "CF", },
];

/* ── Workflow builder nodes ── */

export const workflowNodes: WorkflowNode[] = [
  { id: "wn-plan", label: "Plan", kind: "phase", status: "active", x: 60, y: 140, connectedTo: ["wn-gate-brief"] },
  { id: "wn-gate-brief", label: "Brief Gate", kind: "gate", status: "active", x: 220, y: 140, connectedTo: ["wn-design"] },
  { id: "wn-design", label: "Design", kind: "phase", status: "active", x: 380, y: 140, connectedTo: ["wn-gate-arch"] },
  { id: "wn-gate-arch", label: "Architecture Gate", kind: "gate", status: "active", x: 540, y: 140, connectedTo: ["wn-develop"] },
  { id: "wn-develop", label: "Develop", kind: "phase", status: "active", x: 700, y: 140, connectedTo: ["wn-gate-review"] },
  { id: "wn-gate-review", label: "Code Review Gate", kind: "gate", status: "active", x: 860, y: 140, connectedTo: ["wn-test"] },
  { id: "wn-test", label: "Test", kind: "phase", status: "active", x: 1020, y: 140, connectedTo: ["wn-gate-proof"] },
  { id: "wn-gate-proof", label: "Proof Gate", kind: "gate", status: "active", x: 1180, y: 140, connectedTo: ["wn-ship"] },
  { id: "wn-ship", label: "Ship", kind: "phase", status: "active", x: 1340, y: 140, connectedTo: ["wn-gate-operate"] },
  { id: "wn-gate-operate", label: "Operate Gate", kind: "gate", status: "active", x: 1500, y: 140, connectedTo: ["wn-operate"] },
  { id: "wn-operate", label: "Operate", kind: "phase", status: "active", x: 1660, y: 140, connectedTo: [] },
  { id: "wn-jira", label: "Jira", kind: "connector", status: "active", x: 60, y: 40, connectedTo: ["wn-plan"] },
  { id: "wn-github", label: "GitHub", kind: "connector", status: "active", x: 700, y: 40, connectedTo: ["wn-develop"] },
  { id: "wn-ga", label: "GitHub Actions", kind: "connector", status: "active", x: 1020, y: 40, connectedTo: ["wn-test"] },
  { id: "wn-sonar", label: "SonarQube", kind: "connector", status: "active", x: 1020, y: 240, connectedTo: ["wn-gate-proof"] },
  { id: "wn-gcp", label: "GCP", kind: "connector", status: "active", x: 1340, y: 40, connectedTo: ["wn-ship"] },
  { id: "wn-pdpl", label: "PDPL Scanner", kind: "policy", status: "active", x: 380, y: 240, connectedTo: ["wn-gate-arch"] },
  { id: "wn-nca", label: "NCA ECC", kind: "policy", status: "active", x: 540, y: 240, connectedTo: ["wn-gate-arch"] },
  { id: "wn-slack", label: "Slack", kind: "connector", status: "active", x: 860, y: 240, connectedTo: ["wn-gate-review"] },
  { id: "wn-memory", label: "Context Hub", kind: "memory", status: "active", x: 220, y: 40, connectedTo: ["wn-design", "wn-plan"] },
  { id: "wn-sn", label: "ServiceNow", kind: "connector", status: "active", x: 1180, y: 240, connectedTo: ["wn-ship"] },
];

export const personas: PersonaDefinition[] = [
  {
    key: "cto",
    label: "CTO Lens",
    shortLabel: "CTO",
    role: "Enterprise portfolio view",
    sidebarSummary:
      "Shows confidence, throughput, and compounding platform value across the release portfolio.",
    commandSummary:
      "Shows whether delivery is creating strategic confidence, controlled speed, and compounding organizational value.",
  },
  {
    key: "lead",
    label: "Delivery Lead Lens",
    shortLabel: "Lead",
    role: "Flow and ownership view",
    sidebarSummary:
      "Highlights phase pressure, queue health, and which work items need intervention next.",
    commandSummary:
      "Shows which stories need escalation, which gates are forming risk, and where flow can be recovered.",
  },
  {
    key: "architect",
    label: "Architect Lens",
    shortLabel: "Architect",
    role: "Design integrity view",
    sidebarSummary:
      "Surfaces impacted services, dependency edges, and design rationale before the build path hardens.",
    commandSummary:
      "Shows where design decisions, service boundaries, and reusable patterns are shaping the release.",
  },
  {
    key: "developer",
    label: "Developer Lens",
    shortLabel: "Developer",
    role: "Execution view",
    sidebarSummary:
      "Pulls forward assigned stories, prior implementations, and the proof expectations attached to the work.",
    commandSummary:
      "Brings next action, story context, prior implementations, and proof expectations into one practical working view.",
  },
  {
    key: "governance",
    label: "Governance Lens",
    shortLabel: "Governance",
    role: "Compliance and audit view",
    sidebarSummary:
      "Emphasizes evidence completeness, control adherence, and readiness for sponsor or regulator review.",
    commandSummary:
      "Shows whether the release can be defended with policy coverage, retained proof, and visible override governance.",
  },
];

export const modules: ModuleDefinition[] = [
  {
    key: "contextCompiler",
    title: "Context Compiler",
    note: "Builds reusable story packs and prior pattern retrieval.",
    dependencyLabel: "Context Hub and story memory",
  },
  {
    key: "proofValidator",
    title: "Proof Validator",
    note: "Assembles evidence packs and evaluates release readiness.",
    dependencyLabel: "Governance and release proof chain",
  },
  {
    key: "policyEngine",
    title: "Policy Engine",
    note: "Applies tenant policy, approvals, and release guardrails.",
    dependencyLabel: "Workflow gates and compliance controls",
  },
  {
    key: "externalConnectors",
    title: "External Connector Pack",
    note: "Adds third party systems into memory and release workflows.",
    dependencyLabel: "Cross system sync and evidence imports",
  },
  {
    key: "codeExecutionLoop",
    title: "Code Execution Loop",
    note: "Autonomous code generation, testing, and iteration with human approval gates.",
    dependencyLabel: "Development agent and sandbox environment",
  },
  {
    key: "operateModule",
    title: "Operate Module",
    note: "Production monitoring, incident response, and operational learning capture.",
    dependencyLabel: "Runtime observability and SRE workflows",
  },
  {
    key: "ideIntegration",
    title: "IDE Integration",
    note: "Context injection, inline governance, and memory sidebar inside developer tools.",
    dependencyLabel: "VS Code, JetBrains, Neovim, and Cursor connectors",
  },
];

export const releaseTrend = [
  { period: "W1", confidence: 76, reuse: 12 },
  { period: "W2", confidence: 79, reuse: 15 },
  { period: "W3", confidence: 82, reuse: 18 },
  { period: "W4", confidence: 86, reuse: 22 },
  { period: "W5", confidence: 91, reuse: 27 },
  { period: "W6", confidence: 94, reuse: 31 },
];

export const memoryTrend = [
  { period: "Jan", value: 8 },
  { period: "Feb", value: 13 },
  { period: "Mar", value: 17 },
  { period: "Apr", value: 21 },
  { period: "May", value: 27 },
  { period: "Jun", value: 31 },
];

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Architecture review due today",
    detail: "Citizen Identity Verification is waiting for final design sign off.",
    time: "12 minutes ago",
    tone: "blue",
  },
  {
    id: "n2",
    title: "Proof coverage slipped on one release item",
    detail: "Cross Ministry Regression Suite needs one more validation artifact.",
    time: "34 minutes ago",
    tone: "amber",
  },
  {
    id: "n3",
    title: "Pattern reuse increased across the release",
    detail: "Three stories reused approved identity and permit flows this cycle.",
    time: "1 hour ago",
    tone: "green",
  },
];

export const stories: Story[] = [
  {
    id: "identity",
    title: "Citizen Identity Verification",
    phase: "Design",
    owner: "Sara Malik",
    ownerRole: "Lead Solution Architect",
    risk: "High",
    confidence: 88,
    memoryLinks: 14,
    evidenceScore: 91,
    summary:
      "Build a governed identity verification orchestration that keeps residency, approval trace, and policy awareness intact from brief to release.",
    nextGate: "Architecture review due today",
    services: ["Identity Service", "Policy Engine", "Audit Graph", "Context Compiler"],
    dependencies: ["Residency rules", "Consent trail", "Approval branch model"],
    personaFocus: {
      cto: "This story determines whether the release can prove identity controls without slowing citizen service adoption.",
      lead: "This is the highest attention story in the release and it is the main source of queue pressure today.",
      architect: "The story crosses identity, workflow, audit, and context layers so design clarity matters before build starts.",
      developer: "The work needs prior implementation context, policy edge cases, and clear proof expectations before coding begins.",
      governance: "This story is the main compliance hotspot because it touches approval trace, residency checks, and retained evidence.",
    },
    personaActions: {
      cto: ["Review the release confidence trend", "Resolve the outstanding architecture decision"],
      lead: ["Unblock the architecture review", "Keep the test phase from inheriting delay"],
      architect: ["Validate service boundaries", "Confirm approval branch design before implementation"],
      developer: ["Open prior identity pattern", "Start with the proof requirements pack"],
      governance: ["Confirm PDPL evidence coverage", "Review override visibility before release approval"],
    },
    phaseStates: [
      {
        phase: "Plan",
        status: "ready",
        title: "Brief approved",
        note: "Context pack and risk framing were accepted before design started.",
      },
      {
        phase: "Design",
        status: "ready",
        title: "Design approved",
        note: "Service interaction and approval branch logic were reviewed and approved.",
      },
      {
        phase: "Develop",
        status: "ready",
        title: "Build complete",
        note: "Implementation finished with all tests passing.",
      },
      {
        phase: "Test",
        status: "ready",
        title: "Tests passed",
        note: "All replay suites and security scans passed.",
      },
      {
        phase: "Ship",
        status: "ready",
        title: "Released",
        note: "Deployed to production with sponsor sign off.",
      },
      {
        phase: "Operate",
        status: "active",
        title: "Live in production",
        note: "Monitoring active. One incident under mitigation.",
      },
      {
        phase: "Develop",
        status: "watch",
        title: "Build path prepared",
        note: "Implementation can start once the approval branch is fixed.",
      },
      {
        phase: "Test",
        status: "watch",
        title: "Proof plan drafted",
        note: "Replay suite and identity checks are mapped but not yet active.",
      },
      {
        phase: "Ship",
        status: "watch",
        title: "Release record pending",
        note: "Sponsor sign off depends on complete evidence and design approval.",
      },
    ],
    memoryEvents: [
      {
        id: "m1",
        kind: "Pattern reuse",
        title: "Umrah permits approval path linked to active identity story",
        detail: "The system surfaced a prior consent model and a reusable sponsor approval chain before design review began.",
        time: "2 hours ago",
      },
      {
        id: "m2",
        kind: "Evidence reuse",
        title: "Health claims evidence pack reused for proof structure",
        detail: "Proof pack sections were cloned and adjusted instead of rebuilt from zero.",
        time: "5 hours ago",
      },
      {
        id: "m3",
        kind: "Lesson learned",
        title: "Policy edge case added from last month approval exception",
        detail: "A prior override gap is now visible inline before engineering starts the workflow branch.",
        time: "Yesterday",
      },
      {
        id: "m4",
        kind: "Context link",
        title: "Code Understanding Index attached to the active design set",
        detail: "Developers can see the last approved verification implementation and its audit trail from the same workspace.",
        time: "2 days ago",
      },
      {
        id: "m4a",
        kind: "Lesson learned",
        title: "API contract v1 rejected for PII exposure in query parameters",
        detail: "API contract v1 was rejected because it exposed PII in query parameters. Agent corrected to use request body. This pattern is now stored for future projects.",
        time: "3 days ago",
      },
      {
        id: "m4b",
        kind: "Pattern reuse",
        title: "Authentication flow reworked to add biometric fallback",
        detail: "Authentication flow was reworked to add biometric fallback after architect review. The updated pattern has been adopted by 3 other projects.",
        time: "4 days ago",
      },
    ],
    serviceImpacts: [
      {
        id: "s1",
        name: "Identity Service",
        layer: "Module System",
        status: "Active change",
        detail: "Adds a verification branch for citizen matching and residency review.",
      },
      {
        id: "s2",
        name: "Policy Engine",
        layer: "Workflow Engine",
        status: "Shared dependency",
        detail: "Controls approval rules, residency checks, and escalation handling.",
      },
      {
        id: "s3",
        name: "Audit Graph",
        layer: "Process and Governance",
        status: "Trace extension",
        detail: "Retains consent and approval lineage as proof events.",
      },
    ],
    governanceQueue: [
      {
        id: "g1",
        title: "Architecture review",
        status: "Needs action",
        owner: "Architecture Office",
        time: "Today at 14:30",
        storyId: "identity",
        storyTitle: "Citizen Identity Verification",
        phaseContext: "Design to Develop transition gate",
      },
      {
        id: "g2",
        title: "Identity control mapping",
        status: "Reviewing",
        owner: "Governance Reviewer",
        time: "Today at 16:00",
        storyId: "identity",
        storyTitle: "Citizen Identity Verification",
        artifactId: "da-identity-components",
        artifactTitle: "Component Diagram: Identity Service Architecture",
        phaseContext: "Design artifact approval",
      },
      {
        id: "g3",
        title: "Release sponsor sign off",
        status: "Ready",
        owner: "Program Director",
        time: "Tomorrow at 09:00",
        storyId: "identity",
        storyTitle: "Citizen Identity Verification",
        phaseContext: "Release sponsor sign off gate",
      },
    ],
    controls: [
      {
        id: "c1",
        title: "Residency validation coverage",
        status: "Healthy",
        detail: "Required rule paths are mapped and testable.",
      },
      {
        id: "c2",
        title: "Override logging",
        status: "Watch",
        detail: "One manual override path still needs event retention confirmation.",
      },
      {
        id: "c3",
        title: "Sponsor approval trace",
        status: "Healthy",
        detail: "Final sponsor path is fully visible across the release record.",
      },
    ],
    rationale: [
      "Keep approval branching in the workflow layer rather than inside the identity module.",
      "Retain policy evaluation outputs as part of the evidence pack so approval decisions stay explainable.",
      "Reuse the accepted consent pattern instead of inventing a story specific branch.",
    ],
    configNotes: [
      "Requires the Policy Engine and Context Compiler to stay active.",
      "Proof Validator should remain enabled for release readiness scoring.",
    ],
    description: "Build a governed identity verification orchestration that connects residency checks, consent management, and approval trace to create a single defensible citizen authentication path. This story spans identity, workflow, audit, and context layers and must complete without introducing any manual overrides before design review closes.",
    acceptanceCriteria: [
      { id: "ac-id-1", text: "Citizen authentication succeeds via Nafath SSO with PDPL consent recorded", met: true },
      { id: "ac-id-2", text: "Residency validation rule executes and logs a proof event for every session", met: true },
      { id: "ac-id-3", text: "Manual override path is gated behind supervisor approval and retained in audit graph", met: false },
      { id: "ac-id-4", text: "Architecture review gate passes before any implementation work begins", met: false },
      { id: "ac-id-5", text: "PDPL evidence pack includes all required consent and processing records", met: true },
    ],
    agentOutputs: {
      Plan: {
        sections: [
          {
            title: "Planning Brief",
            type: "brief",
            content: "Problem: Citizens require a unified identity verification path that meets PDPL requirements and NCA ECC controls across all ministry services. Scope: Identity verification module with Nafath SSO integration, consent management, and proof chain recording. Stakeholders: Ministry of Interior, Governance Office, Architecture Review Board. Success metrics: Zero verification failures in test replay, 100% PDPL consent coverage, approval trace retained for all sessions.",
            status: "approved",
            agentName: "Planning Agent",
            reviewedBy: "Sara Malik",
          },
          {
            title: "Architecture Impact",
            type: "architecture_impact",
            content: "Layers affected: Customer Interaction (new auth UI), Module System (Identity Service changes), Process and Governance (audit trace extension). Five services require modification. Design gate is required before build begins.",
            items: ["Customer Interaction", "Module System", "Process and Governance"],
            status: "approved",
            agentName: "Planning Agent",
            reviewedBy: "Sara Malik",
          },
        ],
      },
      Design: {
        sections: [
          {
            title: "User Flow",
            type: "design_flow",
            content: "Access service portal, present PDPL consent screen, initiate Nafath verification, citizen confirms via Nafath app, session established with proof event recorded.",
            items: ["Access Service Portal", "PDPL Consent Screen", "Nafath Verification Prompt", "Citizen Confirms via App", "Session Established and Proof Recorded"],
            status: "awaiting_review",
            agentName: "Design Agent",
          },
          {
            title: "Component Diagram",
            type: "component_diagram",
            content: "Identity Service orchestrates verification and connects to Policy Engine for residency checks and Audit Graph for proof retention. Auth Gateway handles Nafath SSO handshake.",
            status: "awaiting_review",
            agentName: "Design Agent",
          },
          {
            title: "Wireframe",
            type: "wireframe",
            content: "Citizen authentication screen: national ID input field, PDPL consent checkbox with policy text, Nafath QR code display area, biometric fallback option, status indicator showing verification progress.",
            status: "awaiting_review",
            agentName: "Design Agent",
          },
        ],
      },
      Develop: {
        sections: [
          {
            title: "Code Summary",
            type: "code_summary",
            content: "Key files: NafathProvider.ts (identity verification), PDPLConsentFlow.ts (consent management), SessionManager.ts (session lifecycle), AuditGraphClient.ts (proof recording). Lines added: 847. Lines removed: 23. Test coverage: 94%.",
            items: ["NafathProvider.ts", "PDPLConsentFlow.ts", "SessionManager.ts", "AuditGraphClient.ts"],
            status: "draft",
            agentName: "Development Agent",
          },
          {
            title: "Test Coverage",
            type: "test_results",
            content: "Unit tests: 62 of 62 passing. Integration tests: 23 of 25 passing (2 skipped pending production Nafath endpoint). Overall coverage: 94.2%.",
            status: "draft",
            agentName: "Development Agent",
          },
        ],
      },
      Test: {
        sections: [
          {
            title: "Test Results",
            type: "test_results",
            content: "Total: 87 tests. Passed: 85. Failed: 0. Skipped: 2. Performance under 1000 concurrent users: 234ms average, 847ms p95, 0% error rate.",
            items: ["NafathProvider: 5 of 5 passed", "PDPLConsentFlow: 4 of 4 passed", "SessionManager: 3 of 3 passed", "Integration: 23 of 25 passed"],
            status: "draft",
            agentName: "QA Agent",
          },
          {
            title: "Security Scan",
            type: "security_scan",
            content: "NCA ECC controls verified. PDPL data handling reviewed. No critical findings. Two advisory items noted: session timeout configuration and audit log retention period require production values before ship.",
            status: "draft",
            agentName: "QA Agent",
          },
        ],
      },
      Ship: {
        sections: [
          {
            title: "Deployment Checklist",
            type: "deploy_checklist",
            content: "Pre deployment tasks for Citizen Identity Verification release to production.",
            items: ["PDPL evidence pack finalized and signed", "NCA ECC control mapping complete", "Nafath API credentials rotated for production", "Session timeout configured for GCP me-central2", "Audit retention policy set to 7 years", "Sponsor approval received from Ministry of Interior", "Rollback procedure documented and tested"],
            status: "draft",
            agentName: "Release Agent",
          },
          {
            title: "Release Notes",
            type: "release_notes",
            content: "Release 24.4 includes the Citizen Identity Verification module with Nafath SSO integration. PDPL consent management is enforced for every session. Audit proof chain records all verification events. NCA ECC controls are mapped and verified. Manual override path requires supervisor approval before execution.",
            status: "draft",
            agentName: "Release Agent",
          },
        ],
      },
    },
    feedbackHistory: [
      {
        id: "fh-id-1",
        author: "Sara Malik",
        text: "The manual override path needs a supervisor approval gate before the audit event fires. Please confirm the workflow branch handles this correctly.",
        timestamp: "2 hours ago",
        phase: "Design",
        type: "feedback",
      },
      {
        id: "fh-id-2",
        author: "Omar Rahman",
        text: "Confirmed. The review gate is in the workflow layer and the audit event only fires after supervisor confirmation.",
        timestamp: "1 hour ago",
        phase: "Design",
        type: "feedback",
      },
    ],
    productionHealth: {
      status: "degraded",
      deployedAt: "2024-03-18T06:00:00Z",
      version: "v2.4.1",
      sloCompliance: 97.2,
      errorRate: 1.8,
      errorRateTrend: [0.8, 0.7, 0.9, 1.1, 0.8, 0.6, 0.7, 0.9, 1.2, 1.5, 1.8, 2.1, 1.9, 1.8, 1.7, 1.6, 1.8, 2.0, 1.9, 1.8, 1.7, 1.5, 1.4, 1.8],
      activeIncidentCount: 1,
      lastIncidentAt: "2024-03-20T08:14:00Z",
      deploymentHistory: [
        { version: "v2.4.1", deployedAt: "2024-03-18T06:00:00Z", status: "success" },
        { version: "v2.4.0", deployedAt: "2024-03-15T22:00:00Z", status: "success" },
        { version: "v2.3.2", deployedAt: "2024-03-10T18:30:00Z", status: "rollback" },
        { version: "v2.3.1", deployedAt: "2024-03-08T14:00:00Z", status: "success" },
      ],
    },
  },
  {
    id: "permit-intake",
    title: "Permit Intake Brief Pack",
    phase: "Plan",
    owner: "Maha Noor",
    ownerRole: "Delivery Manager",
    risk: "Medium",
    confidence: 91,
    memoryLinks: 6,
    evidenceScore: 84,
    summary:
      "Standardize intake context, estimate confidence, and release impact before downstream work begins.",
    nextGate: "Brief approval waiting",
    services: ["Context Compiler", "Workflow Engine", "Portfolio Dashboard"],
    dependencies: ["Tenant policy profile", "Scope brief", "Prior permit patterns"],
    personaFocus: {
      cto: "This story improves the quality of work entering the system and raises confidence before cost is spent.",
      lead: "The story reduces avoidable churn by making briefs comparable before work enters design.",
      architect: "It creates a cleaner design starting point by enriching scope and prior pattern context.",
      developer: "It lowers rework because implementation starts from a stronger brief and reusable references.",
      governance: "It creates traceability from the first intake step, which matters later in sponsor review.",
    },
    personaActions: {
      cto: ["Review intake quality trend", "Compare risk distribution across new work"],
      lead: ["Push the brief into approval", "Resolve missing scope context"],
      architect: ["Check dependency clarity", "Confirm domain alignment before design starts"],
      developer: ["Review reusable intake pack", "Prepare starter context for the next phase"],
      governance: ["Confirm policy coverage in the brief", "Check sponsor fields are captured"],
    },
    phaseStates: [
      {
        phase: "Plan",
        status: "active",
        title: "Brief awaiting approval",
        note: "One approver is still missing before the design handoff can begin.",
      },
      {
        phase: "Design",
        status: "watch",
        title: "Design queue reserved",
        note: "Design is ready to start once approval lands.",
      },
      {
        phase: "Develop",
        status: "watch",
        title: "Implementation not started",
        note: "No engineering work should begin before scope is approved.",
      },
      {
        phase: "Test",
        status: "watch",
        title: "Proof plan not required yet",
        note: "Evidence scaffolding will be created after the design gate.",
      },
      {
        phase: "Ship",
        status: "watch",
        title: "Release stage inactive",
        note: "No release preparation until the story matures downstream.",
      },
    ],
    memoryEvents: [
      {
        id: "m5",
        kind: "Pattern reuse",
        title: "Tourism permit intake template recommended",
        detail: "The system suggested a prior structure to shorten intake drafting time.",
        time: "1 hour ago",
      },
      {
        id: "m6",
        kind: "Lesson learned",
        title: "Missing sponsor field from a prior failed intake added",
        detail: "A gap found in an earlier program is now captured before approval.",
        time: "Yesterday",
      },
      {
        id: "m7",
        kind: "Context link",
        title: "Scope similarity linked to existing permit workflows",
        detail: "Two related ministry flows were attached as reference material.",
        time: "2 days ago",
      },
    ],
    serviceImpacts: [
      {
        id: "s4",
        name: "Context Compiler",
        layer: "Data and Context",
        status: "Active change",
        detail: "Adds structured intake fields for scope and release impact.",
      },
      {
        id: "s5",
        name: "Workflow Engine",
        layer: "Process and Governance",
        status: "Gate update",
        detail: "Adds an approval checkpoint before design can begin.",
      },
    ],
    governanceQueue: [
      {
        id: "g4",
        title: "Brief sponsor approval",
        status: "Reviewing",
        owner: "Program Office",
        time: "Today at 17:00",
        storyId: "permit-intake",
        storyTitle: "Permit Intake Brief Pack",
        phaseContext: "Plan to Design transition gate",
      },
    ],
    controls: [
      {
        id: "c4",
        title: "Scope completeness",
        status: "Watch",
        detail: "One dependency note still needs confirmation.",
      },
      {
        id: "c5",
        title: "Intake trace retention",
        status: "Healthy",
        detail: "The intake record is retained and versioned.",
      },
    ],
    rationale: [
      "Keep intake strict enough to lower churn without blocking useful exploration.",
      "Attach comparable prior stories at the brief stage so later teams inherit stronger context.",
    ],
    configNotes: [
      "Context Compiler materially improves the value of this story.",
      "External Connector Pack can enrich intake data but is optional.",
    ],
    description: "Standardize how briefs enter the delivery system by enriching each intake with prior pattern context, scope comparison, and release impact framing before any design work begins. This story improves the quality of all downstream work by ensuring the brief is comparable, sponsor fields are captured, and policy coverage is confirmed at the front door.",
    acceptanceCriteria: [
      { id: "ac-pi-1", text: "Intake form captures all required sponsor and scope fields", met: true },
      { id: "ac-pi-2", text: "System surfaces at least two comparable prior stories from context store", met: true },
      { id: "ac-pi-3", text: "Confidence estimate is generated before brief enters approval", met: true },
      { id: "ac-pi-4", text: "Release impact framing is attached to the brief before approval", met: false },
      { id: "ac-pi-5", text: "Brief approval gate requires sign off from Program Office before design begins", met: false },
      { id: "ac-pi-6", text: "Policy coverage is confirmed in the brief before approval", met: false },
    ],
    agentOutputs: {
      Plan: {
        sections: [
          {
            title: "Planning Brief",
            type: "brief",
            content: "Problem: Briefs entering the system lack comparable prior context, sponsor sign off fields, and release impact framing. This causes avoidable churn when design starts without full scope clarity. Scope: Intake enrichment module that attaches prior patterns, generates confidence estimates, and enforces approval before design begins. Stakeholders: Program Office, Delivery Lead, Architecture Team. Success metrics: Intake approval time reduced by 40%, churn from incomplete briefs eliminated, comparable prior stories attached to every intake.",
            status: "awaiting_review",
            agentName: "Planning Agent",
          },
          {
            title: "Architecture Impact",
            type: "architecture_impact",
            content: "Layers affected: Data and Context (Context Compiler enrichment), Process and Governance (approval gate addition). Two services require modification. No new service boundaries introduced.",
            items: ["Data and Context", "Process and Governance"],
            status: "awaiting_review",
            agentName: "Planning Agent",
          },
        ],
      },
      Design: {
        sections: [
          {
            title: "User Flow",
            type: "design_flow",
            content: "Delivery lead creates intake brief, system enriches with prior patterns, confidence estimate generated, sponsor fields completed, release impact framing attached, brief submitted for approval.",
            items: ["Create Intake Brief", "System Enriches with Prior Patterns", "Confidence Estimate Generated", "Sponsor Fields Completed", "Release Impact Attached", "Submit for Approval"],
            status: "draft",
            agentName: "Design Agent",
          },
          {
            title: "Component Diagram",
            type: "component_diagram",
            content: "Context Compiler enriches intake with prior pattern links. Workflow Engine adds approval checkpoint. Portfolio Dashboard updates with new intake.",
            status: "draft",
            agentName: "Design Agent",
          },
        ],
      },
      Develop: {
        sections: [
          {
            title: "Code Summary",
            type: "code_summary",
            content: "Key files: IntakeEnricher.ts, BriefApprovalGate.ts, ContextCompilerClient.ts. Lines added: 412. Lines removed: 0. Test coverage: 88%.",
            items: ["IntakeEnricher.ts", "BriefApprovalGate.ts", "ContextCompilerClient.ts"],
            status: "draft",
            agentName: "Development Agent",
          },
        ],
      },
      Test: {
        sections: [
          {
            title: "Test Results",
            type: "test_results",
            content: "Total: 41 tests. Passed: 38. Failed: 0. Skipped: 3. Intake enrichment and approval gate integration covered.",
            status: "draft",
            agentName: "QA Agent",
          },
          {
            title: "Security Scan",
            type: "security_scan",
            content: "No critical findings. Intake records are versioned and retained. Approval audit events fire correctly.",
            status: "draft",
            agentName: "QA Agent",
          },
        ],
      },
      Ship: {
        sections: [
          {
            title: "Deployment Checklist",
            type: "deploy_checklist",
            content: "Pre deployment tasks for Permit Intake Brief Pack release.",
            items: ["Context Compiler enrichment rules activated", "Approval gate configured with Program Office role", "Intake record retention policy confirmed", "Confidence model weights reviewed", "Portfolio Dashboard updated to reflect new intake status", "Sponsor notification email template verified"],
            status: "draft",
            agentName: "Release Agent",
          },
          {
            title: "Release Notes",
            type: "release_notes",
            content: "This release introduces standardized brief intake with automatic prior pattern enrichment. All new briefs now require Program Office approval before design can begin. Confidence estimates are generated at intake time. Comparable prior stories are attached automatically by the Context Compiler.",
            status: "draft",
            agentName: "Release Agent",
          },
        ],
      },
    },
    feedbackHistory: [
      {
        id: "fh-pi-1",
        author: "Dana Youssef",
        text: "The release impact framing section is still empty in the current brief draft. This needs to be completed before sponsor approval.",
        timestamp: "3 hours ago",
        phase: "Plan",
        type: "feedback",
      },
      {
        id: "fh-pi-2",
        author: "Maha Noor",
        text: "Acknowledged. I will complete the release impact section today before end of day.",
        timestamp: "2 hours ago",
        phase: "Plan",
        type: "feedback",
      },
      {
        id: "fh-pi-3",
        author: "Sara Malik",
        text: "Also confirm that the policy coverage field references the correct PDPL article for permit data handling.",
        timestamp: "1 hour ago",
        phase: "Plan",
        type: "feedback",
      },
    ],
  },
  {
    id: "policy-rules",
    title: "Permit Policy Rules Engine",
    phase: "Operate",
    owner: "Omar Rahman",
    ownerRole: "Senior Software Engineer",
    risk: "Medium",
    confidence: 93,
    memoryLinks: 11,
    evidenceScore: 86,
    summary:
      "Implement reusable permit policy rules with a human review gate before automatic enforcement.",
    nextGate: "Code review next",
    services: ["Policy Engine", "Workflow Engine", "Audit Graph"],
    dependencies: ["Review gate service", "Rule schema", "Policy library"],
    personaFocus: {
      cto: "This story increases policy reuse and reduces the cost of inconsistent decision logic across tenants.",
      lead: "The work is moving well and should not become a hidden blocker for test readiness.",
      architect: "Schema boundaries and review gate placement are the critical design concerns.",
      developer: "Implementation is ready, but the human review hook and audit event shape must stay intact.",
      governance: "This work controls whether policy decisions remain explainable and reviewable before activation.",
    },
    personaActions: {
      cto: ["Track reuse impact", "Ensure policy review does not slow the release"],
      lead: ["Prepare testing handoff", "Keep review gate owner aligned"],
      architect: ["Validate rule schema durability", "Check review gate boundaries"],
      developer: ["Complete code review fixes", "Attach audit event examples"],
      governance: ["Review explainability fields", "Check approval before activation"],
    },
    phaseStates: [
      {
        phase: "Plan",
        status: "ready",
        title: "Scope approved",
        note: "Policy objectives and tenant fit were aligned early.",
      },
      {
        phase: "Design",
        status: "ready",
        title: "Design accepted",
        note: "The review gate and rule schema were signed off before build.",
      },
      {
        phase: "Develop",
        status: "ready",
        title: "Build complete",
        note: "Engineering finalized the reusable rule model and audit hooks.",
      },
      {
        phase: "Test",
        status: "ready",
        title: "Tests passed",
        note: "Validation scenarios and replay suite passed successfully.",
      },
      {
        phase: "Ship",
        status: "ready",
        title: "Released",
        note: "Deployed to production with governance approval.",
      },
      {
        phase: "Operate",
        status: "active",
        title: "Live in production",
        note: "Monitoring active. All services healthy.",
      },
    ],
    memoryEvents: [
      {
        id: "m8",
        kind: "Pattern reuse",
        title: "Reusable rule schema suggested from customs policy flow",
        detail: "The platform matched an earlier rule set and accelerated implementation planning.",
        time: "3 hours ago",
      },
      {
        id: "m9",
        kind: "Context link",
        title: "Review gate examples attached for the active developer",
        detail: "The latest approved workflow examples are now visible inside the engineering context.",
        time: "Yesterday",
      },
    ],
    serviceImpacts: [
      {
        id: "s6",
        name: "Policy Engine",
        layer: "Module System",
        status: "Core change",
        detail: "Adds reusable rule packages and review aware enforcement.",
      },
      {
        id: "s7",
        name: "Audit Graph",
        layer: "Process and Governance",
        status: "Event extension",
        detail: "Stores rule review and activation events for later audit.",
      },
    ],
    governanceQueue: [
      {
        id: "g5",
        title: "Rule package review",
        status: "Ready",
        owner: "Architecture Office",
        time: "Tomorrow at 10:00",
        storyId: "policy-rules",
        storyTitle: "Permit Policy Rules Engine",
        phaseContext: "Develop to Test transition gate",
      },
    ],
    controls: [
      {
        id: "c6",
        title: "Human review enforcement",
        status: "Healthy",
        detail: "Automatic enforcement remains blocked until review completes.",
      },
      {
        id: "c7",
        title: "Audit event coverage",
        status: "Healthy",
        detail: "The activation event model is complete.",
      },
    ],
    rationale: [
      "Keep rules composable so tenant configuration stays inside the product instead of code forks.",
      "Treat review as a first class workflow event rather than a hidden implementation detail.",
    ],
    configNotes: [
      "Policy Engine is the main dependency.",
      "Proof Validator helps later activation evidence but is not required for development itself.",
    ],
    description: "Implement a reusable policy rule engine that allows tenants to configure, review, and activate permit decision logic without code changes. A mandatory human review gate blocks automatic enforcement until a designated reviewer approves the rule package, ensuring every policy activation is traceable and explainable.",
    acceptanceCriteria: [
      { id: "ac-pr-1", text: "Policy rules can be authored and versioned without code deployments", met: true },
      { id: "ac-pr-2", text: "Human review gate blocks automatic enforcement until reviewer approves", met: true },
      { id: "ac-pr-3", text: "Every rule activation produces an audit event with reviewer identity", met: true },
      { id: "ac-pr-4", text: "Rules are composable and reusable across multiple tenants", met: true },
      { id: "ac-pr-5", text: "Code review passes with no critical findings before test phase begins", met: false },
    ],
    agentOutputs: {
      Plan: {
        sections: [
          {
            title: "Planning Brief",
            type: "brief",
            content: "Problem: Policy decision logic is currently scattered across service implementations, making it impossible to reuse or audit consistently. Scope: Reusable policy rule engine with tenant configuration, human review gate, and activation audit trail. Stakeholders: Architecture Office, Governance Reviewer, Program Director. Success metrics: Rule reuse across at least 3 tenants, zero unauthorized activations, all activation events retained in audit graph.",
            status: "approved",
            agentName: "Planning Agent",
            reviewedBy: "Sara Malik",
          },
          {
            title: "Architecture Impact",
            type: "architecture_impact",
            content: "Layers affected: Module System (Policy Engine core change), Process and Governance (review gate addition), Data and Context (rule schema storage). Schema boundaries and review gate placement are the critical design concerns.",
            items: ["Module System", "Process and Governance", "Data and Context"],
            status: "approved",
            agentName: "Planning Agent",
            reviewedBy: "Sara Malik",
          },
        ],
      },
      Design: {
        sections: [
          {
            title: "Component Diagram",
            type: "component_diagram",
            content: "Rule Registry stores versioned rule packages. Rule Evaluator applies rules against request context. Review Gate holds enforcement until human approval. Audit Graph records every evaluation and activation event.",
            status: "approved",
            agentName: "Design Agent",
            reviewedBy: "Sara Malik",
          },
          {
            title: "Wireframe",
            type: "wireframe",
            content: "Policy rule editor screen: rule name and category fields, condition builder with tenant context, activation status indicator, reviewer assignment dropdown, activation history timeline.",
            status: "approved",
            agentName: "Design Agent",
            reviewedBy: "Sara Malik",
          },
        ],
      },
      Develop: {
        sections: [
          {
            title: "Code Summary",
            type: "code_summary",
            content: "Key files: PolicyRuleRegistry.ts, RuleEvaluator.ts, ReviewGate.ts, AuditEventEmitter.ts. Lines added: 1204. Lines removed: 67. Test coverage: 91%. Code review in progress.",
            items: ["PolicyRuleRegistry.ts", "RuleEvaluator.ts", "ReviewGate.ts", "AuditEventEmitter.ts"],
            status: "awaiting_review",
            agentName: "Development Agent",
          },
          {
            title: "Test Results",
            type: "test_results",
            content: "Unit tests: 78 of 78 passing. Integration tests: 19 of 21 passing (2 running). Overall coverage: 91.4%.",
            status: "awaiting_review",
            agentName: "Development Agent",
          },
        ],
      },
      Test: {
        sections: [
          {
            title: "Test Results",
            type: "test_results",
            content: "Total: 99 tests. Passed: 97. Failed: 0. Skipped: 2. Replay suite covers rule evaluation, review gate, and activation audit paths.",
            status: "draft",
            agentName: "QA Agent",
          },
          {
            title: "Security Scan",
            type: "security_scan",
            content: "No critical findings. Rule package signing verified. Activation endpoint requires reviewer token. Audit events are immutable once written.",
            status: "draft",
            agentName: "QA Agent",
          },
        ],
      },
      Ship: {
        sections: [
          {
            title: "Deployment Checklist",
            type: "deploy_checklist",
            content: "Pre deployment tasks for Permit Policy Rules Engine release.",
            items: ["Rule package signing keys rotated", "Review gate reviewer roles configured per tenant", "Audit graph schema migration verified", "Policy Engine module enabled in platform config", "Tenant onboarding documentation updated", "Activation notification emails tested", "Rollback to previous rule packages validated"],
            status: "draft",
            agentName: "Release Agent",
          },
          {
            title: "Release Notes",
            type: "release_notes",
            content: "This release introduces the reusable policy rules engine with tenant configuration and human review gating. All rule activations are blocked until a designated reviewer approves. Every evaluation and activation event is retained in the audit graph for governance traceability.",
            status: "draft",
            agentName: "Release Agent",
          },
        ],
      },
    },
    feedbackHistory: [
      {
        id: "fh-pr-1",
        author: "Sara Malik",
        text: "Confirm that the review gate cannot be bypassed by any service account. This is a governance requirement.",
        timestamp: "Yesterday",
        phase: "Develop",
        type: "feedback",
      },
      {
        id: "fh-pr-2",
        author: "Omar Rahman",
        text: "Confirmed. The review gate is enforced at the workflow layer and no service account has bypass permission. Reviewed the implementation today.",
        timestamp: "Yesterday",
        phase: "Develop",
        type: "approval",
      },
    ],
    productionHealth: {
      status: "healthy",
      deployedAt: "2024-03-16T04:00:00Z",
      version: "v1.8.3",
      sloCompliance: 99.7,
      errorRate: 0.04,
      errorRateTrend: [0.05, 0.04, 0.03, 0.04, 0.05, 0.04, 0.03, 0.04, 0.05, 0.04, 0.03, 0.04, 0.05, 0.04, 0.03, 0.04, 0.05, 0.04, 0.03, 0.04, 0.05, 0.04, 0.03, 0.04],
      activeIncidentCount: 0,
      deploymentHistory: [
        { version: "v1.8.3", deployedAt: "2024-03-16T04:00:00Z", status: "success" },
        { version: "v1.8.2", deployedAt: "2024-03-12T20:00:00Z", status: "success" },
        { version: "v1.8.1", deployedAt: "2024-03-08T18:00:00Z", status: "success" },
        { version: "v1.8.0", deployedAt: "2024-03-05T14:00:00Z", status: "success" },
      ],
    },
  },
  {
    id: "regression-suite",
    title: "Cross Ministry Regression Suite",
    phase: "Test",
    owner: "Rayan Fares",
    ownerRole: "Quality Engineering Lead",
    risk: "Medium",
    confidence: 90,
    memoryLinks: 9,
    evidenceScore: 79,
    summary:
      "Verify release readiness across identity, workflow, and evidence paths before ship.",
    nextGate: "Proof validation running",
    services: ["Proof Validator", "Test Replay Service", "Audit Graph"],
    dependencies: ["Replay fixtures", "Approval snapshots", "Release evidence map"],
    personaFocus: {
      cto: "This story determines whether the release is truly defensible before sponsor commitment.",
      lead: "It is the final confidence builder before ship and should stay visible every day.",
      architect: "The replay path shows whether system boundaries still behave correctly together.",
      developer: "The suite reveals cross service failures before they reach release approval.",
      governance: "It confirms that required proof exists for the release story and not just the code path.",
    },
    personaActions: {
      cto: ["Review the remaining proof gap", "Decide if ship remains on schedule"],
      lead: ["Chase missing validation artifact", "Protect the release date"],
      architect: ["Inspect boundary failures if confidence slips", "Review shared service contracts"],
      developer: ["Fix replay issue if it appears", "Attach missing artifact quickly"],
      governance: ["Confirm evidence completeness", "Check release pack before sponsor review"],
    },
    phaseStates: [
      {
        phase: "Plan",
        status: "ready",
        title: "Testing scope agreed",
        note: "Replay scope and required artifacts are settled.",
      },
      {
        phase: "Design",
        status: "ready",
        title: "Validation design approved",
        note: "Cross service replay logic was reviewed early.",
      },
      {
        phase: "Develop",
        status: "ready",
        title: "Fixtures assembled",
        note: "Test data and event paths are ready for execution.",
      },
      {
        phase: "Test",
        status: "active",
        title: "Proof validation running",
        note: "One artifact is still missing before confidence becomes release ready.",
      },
      {
        phase: "Ship",
        status: "watch",
        title: "Release hold",
        note: "Sponsor approval should wait for full replay completion.",
      },
    ],
    memoryEvents: [
      {
        id: "m10",
        kind: "Evidence reuse",
        title: "Replay pack cloned from the prior customs release",
        detail: "The team reused a validated evidence structure to accelerate test readiness.",
        time: "6 hours ago",
      },
      {
        id: "m11",
        kind: "Lesson learned",
        title: "Late artifact gap from a previous release surfaced as a warning",
        detail: "The platform now flags the same condition before sponsor review begins.",
        time: "Yesterday",
      },
    ],
    serviceImpacts: [
      {
        id: "s8",
        name: "Proof Validator",
        layer: "Intelligence and Orchestration",
        status: "Active run",
        detail: "Evaluates replay results and evidence completeness in one scoring pass.",
      },
      {
        id: "s9",
        name: "Audit Graph",
        layer: "Process and Governance",
        status: "Read only trace",
        detail: "Supplies the retained events used to form the release record.",
      },
    ],
    governanceQueue: [
      {
        id: "g6",
        title: "Replay evidence gap review",
        status: "Needs action",
        owner: "Quality Governance",
        time: "Today at 15:00",
        storyId: "regression-suite",
        storyTitle: "Cross Ministry Regression Suite",
        phaseContext: "Test to Ship transition gate",
      },
    ],
    controls: [
      {
        id: "c8",
        title: "Replay completeness",
        status: "Watch",
        detail: "One required artifact is not yet attached.",
      },
      {
        id: "c9",
        title: "Evidence traceability",
        status: "Healthy",
        detail: "All retained events resolve correctly to the release record.",
      },
    ],
    rationale: [
      "Keep testing and evidence scoring together so readiness is not guessed from separate tools.",
      "Use retained audit events instead of manually curated release notes whenever possible.",
    ],
    configNotes: [
      "Proof Validator is essential here.",
      "External connectors can expand replay scope but are not required.",
    ],
    description: "Verify release readiness across all identity, workflow, and evidence paths by executing a comprehensive replay suite against the release candidate. The suite assembles proof validation scores and generates an evidence pack that must meet the release threshold before sponsor approval is requested.",
    acceptanceCriteria: [
      { id: "ac-rs-1", text: "Replay suite covers all identity, workflow, and permit paths across service boundaries", met: true },
      { id: "ac-rs-2", text: "Proof Validator produces a release readiness score before sponsor review", met: true },
      { id: "ac-rs-3", text: "Evidence pack includes all required compliance artifacts", met: false },
      { id: "ac-rs-4", text: "No critical failures in any cross service scenario", met: true },
      { id: "ac-rs-5", text: "Release confidence score reaches 95% before ship gate opens", met: false },
    ],
    agentOutputs: {
      Plan: {
        sections: [
          {
            title: "Planning Brief",
            type: "brief",
            content: "Problem: Release confidence cannot be asserted without a cross service regression that proves all shared paths still behave correctly together. Scope: Automated replay suite covering identity, permit workflow, and evidence paths. Proof Validator integration for release scoring. Stakeholders: Quality Governance, Program Director, Architecture Office. Success metrics: All critical paths covered, evidence pack completeness above 95%, sponsor review unblocked.",
            status: "approved",
            agentName: "Planning Agent",
            reviewedBy: "Rayan Fares",
          },
        ],
      },
      Design: {
        sections: [
          {
            title: "User Flow",
            type: "design_flow",
            content: "QA lead selects test suite and release target, fixtures loaded from context store, cross service replay executed, Proof Validator scores coverage, evidence pack assembled and linked to release record.",
            items: ["Select Test Suite", "Load Fixtures", "Execute Cross Service Replay", "Score Evidence Coverage", "Assemble Evidence Pack", "Link to Release Record"],
            status: "approved",
            agentName: "Design Agent",
            reviewedBy: "Rayan Fares",
          },
          {
            title: "Component Diagram",
            type: "component_diagram",
            content: "Test Replay Service executes recorded scenarios. Proof Validator scores coverage. Audit Graph retains results as immutable evidence.",
            status: "approved",
            agentName: "Design Agent",
            reviewedBy: "Rayan Fares",
          },
        ],
      },
      Develop: {
        sections: [
          {
            title: "Code Summary",
            type: "code_summary",
            content: "Key files: ReplaySuite.ts, ProofScorer.ts, EvidencePackBuilder.ts. Lines added: 634. Lines removed: 12. Test coverage: 89%. All fixtures assembled and validated.",
            items: ["ReplaySuite.ts", "ProofScorer.ts", "EvidencePackBuilder.ts"],
            status: "approved",
            agentName: "Development Agent",
            reviewedBy: "Sara Malik",
          },
        ],
      },
      Test: {
        sections: [
          {
            title: "Test Results",
            type: "test_results",
            content: "Total: 67 cross service scenarios. Passed: 65. Failed: 0. Skipped: 2 (production Nafath endpoint required). Proof validation score: 79%. One evidence artifact still missing.",
            items: ["Identity paths: 18 of 18 passed", "Permit workflow paths: 24 of 24 passed", "Evidence chain paths: 23 of 23 passed", "Cross ministry paths: skipped (2)"],
            status: "awaiting_review",
            agentName: "QA Agent",
          },
          {
            title: "Security Scan",
            type: "security_scan",
            content: "Security scan passed. No critical findings in the replay infrastructure. Audit log retention confirmed. Proof chain integrity verified.",
            status: "awaiting_review",
            agentName: "QA Agent",
          },
        ],
      },
      Ship: {
        sections: [
          {
            title: "Deployment Checklist",
            type: "deploy_checklist",
            content: "Pre deployment tasks for Cross Ministry Regression Suite ship gate.",
            items: ["Missing evidence artifact attached and verified", "Proof validation score above 95%", "Sponsor review pack exported and delivered", "All skipped tests accounted for with documented justification", "Release record finalized in audit graph", "Program Director sign off received"],
            status: "draft",
            agentName: "Release Agent",
          },
          {
            title: "Release Notes",
            type: "release_notes",
            content: "The cross ministry regression suite now covers all critical paths across identity, permit workflow, and evidence layers. Proof Validator integration provides a scored release readiness assessment. Evidence packs are assembled automatically and linked to the release record for sponsor review.",
            status: "draft",
            agentName: "Release Agent",
          },
        ],
      },
    },
    feedbackHistory: [
      {
        id: "fh-rs-1",
        author: "Rayan Fares",
        text: "One evidence artifact is still missing from the proof pack. Need to resolve before sponsor review can begin.",
        timestamp: "6 hours ago",
        phase: "Test",
        type: "feedback",
      },
    ],
  },
];

export const currentUser = {
  name: "Sara Malik",
  role: "Lead Solution Architect",
  initials: "SM",
};

export const personaMetricCards: Record<PersonaKey, MetricCard[]> = {
  cto: [
    {
      label: "Release confidence",
      value: "94%",
      note: "Evidence remains complete across the current release train.",
      tone: "blue",
    },
    {
      label: "Memory reuse",
      value: "+31%",
      note: "Approved patterns are being reused across more stories this cycle.",
      tone: "green",
    },
    {
      label: "Governed stories",
      value: "43",
      note: "Live stories continue to move inside the formal operating model.",
      tone: "slate",
    },
    {
      label: "Cost guardrails",
      value: "On",
      note: "Token caps and scope boundaries remain active.",
      tone: "amber",
    },
  ],
  lead: [
    {
      label: "Stories needing action",
      value: "5",
      note: "Active items need escalation across design, test, and sponsor review.",
      tone: "blue",
    },
    {
      label: "Queue stability",
      value: "82%",
      note: "Most phase transitions remain within the target handoff window.",
      tone: "green",
    },
    {
      label: "Delayed approvals",
      value: "2",
      note: "Only two approvals are likely to affect release posture this week.",
      tone: "amber",
    },
    {
      label: "Rework avoided",
      value: "17h",
      note: "Memory and stronger briefs prevented avoidable churn this cycle.",
      tone: "slate",
    },
  ],
  architect: [
    {
      label: "Active service impacts",
      value: "11",
      note: "Cross layer changes are being tracked before build paths harden.",
      tone: "blue",
    },
    {
      label: "Design reuse",
      value: "68%",
      note: "Approved patterns continue to shorten design review time.",
      tone: "green",
    },
    {
      label: "Boundary risks",
      value: "3",
      note: "Only three service edges remain under watch in this release.",
      tone: "amber",
    },
    {
      label: "Rationale captured",
      value: "96%",
      note: "Design decisions are being retained for future stories.",
      tone: "slate",
    },
  ],
  developer: [
    {
      label: "Stories ready to build",
      value: "7",
      note: "Enough context exists to start execution without re gathering history.",
      tone: "blue",
    },
    {
      label: "Reusable context packs",
      value: "19",
      note: "Teams can pull prior implementations and proof expectations directly.",
      tone: "green",
    },
    {
      label: "Proof tasks pending",
      value: "4",
      note: "A small number of release artifacts still need to be attached.",
      tone: "amber",
    },
    {
      label: "Cycle time saved",
      value: "26%",
      note: "Developers are spending less time reconstructing missing context.",
      tone: "slate",
    },
  ],
  governance: [
    {
      label: "Evidence completeness",
      value: "91%",
      note: "Most release artifacts are already connected to the proof chain.",
      tone: "blue",
    },
    {
      label: "Policy adherence",
      value: "97%",
      note: "Only a small number of control exceptions remain open.",
      tone: "green",
    },
    {
      label: "Overrides under review",
      value: "2",
      note: "Manual exceptions remain visible and owner assigned.",
      tone: "amber",
    },
    {
      label: "Regulator ready stories",
      value: "12",
      note: "These items already meet the current sponsor review threshold.",
      tone: "slate",
    },
  ],
};

export function buildScreenPath(screen: ScreenKey, storyId?: string) {
  return storyId ? `/${screen}/${storyId}` : `/${screen}`;
}

export function buildSearchResults(): SearchResult[] {
  const screenResults: SearchResult[] = screens.map(screen => ({
    id: `screen-${screen.key}`,
    title: screen.label,
    detail: `Open the ${screen.label} workspace`,
    category: "Screen",
    screen: screen.key,
  }));

  const storyResults: SearchResult[] = stories.map(story => ({
    id: `story-${story.id}`,
    title: story.title,
    detail: `${story.phase} phase with ${story.owner}`,
    category: "Story",
    screen: "delivery",
    storyId: story.id,
  }));

  const approvalResults: SearchResult[] = stories.flatMap(story =>
    story.governanceQueue.map(item => ({
      id: `${story.id}-${item.id}`,
      title: item.title,
      detail: `${story.title} · ${item.owner}`,
      category: "Approval",
      screen: "governance" as ScreenKey,
      storyId: story.id,
    }))
  );

  const moduleResults: SearchResult[] = modules.map(module => ({
    id: `module-${module.key}`,
    title: module.title,
    detail: module.note,
    category: "Module",
    screen: "config",
  }));

  return [...screenResults, ...storyResults, ...approvalResults, ...moduleResults];
}
