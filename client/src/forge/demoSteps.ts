import type { DemoStep } from "@/forge/types";

export const unifiedJourneySteps: DemoStep[] = [
  {
    id: "step-1",
    screen: "portfolio",
    title: "The Platform",
    narration: "Welcome to Arkitekt Forge. You are looking at the portfolio view showing all tenants managed by this platform. Each tenant has its own workspace, connectors, and governance posture.",
    persona: "cto",
  },
  {
    id: "step-2",
    screen: "portfolio",
    title: "Create a New Project",
    narration: "Let us create a new project. Click Create Project and select Government Digital Service. This auto configures 7 phases, dual approval gates, PDPL compliance, and the Nafath connector.",
    action: "open-create-project",
    persona: "cto",
  },
  {
    id: "step-3",
    screen: "command",
    title: "Command Center: CTO View",
    narration: "Switch to the CTO persona. The Command Center adapts instantly: portfolio KPIs, release confidence trend, proof chain gauge, and compounding value all come into focus. This is how a CTO sees the programme.",
    persona: "cto",
  },
  {
    id: "step-4",
    screen: "delivery",
    title: "Delivery Flow: Stories in Motion",
    narration: "The Delivery Flow shows stories moving through the phases configured for this project type. Each column is a phase: Directive, Analysis, Design, Build, Test, Compliance, Release. Forge tracks everything.",
    persona: "lead",
  },
  {
    id: "step-5",
    screen: "delivery",
    title: "Advance a Story with a Gate",
    narration: "Click the advance button on the Citizen Authentication story. A gate dialog appears showing the required approvers, evidence status, and proof chain completeness. This is zero trust delivery.",
    action: "open-story-transition",
    persona: "lead",
  },
  {
    id: "step-6",
    screen: "command",
    title: "AI Agent: Context Compilation",
    narration: "Click Generate Brief in the AI Agent panel. Watch it compile context from 142 memory artifacts across 4 projects, identify 7 reusable patterns, and surface 3 critical lessons from previous releases.",
    action: "trigger-ai-brief",
    persona: "architect",
  },
  {
    id: "step-7",
    screen: "context",
    title: "Context Hub: Institutional Memory",
    narration: "The Context Hub shows the memory layer in action. Enable cross project view to see patterns from all Ministry of Interior projects. Every lesson, pattern, and evidence artifact is retained and searchable.",
    persona: "architect",
  },
  {
    id: "step-8",
    screen: "governance",
    title: "Governance: Proof Chain and Compliance",
    narration: "The Governance screen shows the proof chain completeness at 94%. All 5 gates have been passed. PDPL coverage is at 98%. Click the evidence export button to generate a compliance pack.",
    persona: "governance",
  },
  {
    id: "step-9",
    screen: "governance",
    title: "Approve a Governance Gate",
    narration: "Click Approve on the release gate. An approval dialog appears with the evidence links, the approver list, and an optional reason field. On confirmation, the proof chain gauge animates to 100%.",
    action: "open-approval-dialog",
    persona: "governance",
  },
  {
    id: "step-10",
    screen: "output",
    title: "Output Viewer: What Was Built",
    narration: "The Output screen shows everything Forge tracked that was built. Live previews of the citizen authentication portal, the Nafath provider code, architecture documents, API specs, and the complete evidence pack.",
    persona: "cto",
  },
  {
    id: "step-11",
    screen: "architecture",
    title: "Architecture: Layer View",
    narration: "The Architecture screen shows which of the 8 platform layers were impacted by this story. The GitHub panel shows the commits and pull requests linked to this delivery, with CI status badges.",
    persona: "architect",
  },
  {
    id: "step-12",
    screen: "config",
    title: "Config Studio: Full Platform Control",
    narration: "Config Studio gives platform teams full control. The Connectors marketplace has 26 integrations across Dev Tools, CI/CD, Compliance, and Identity. The Workflow Builder visualises the current delivery model.",
    persona: "developer",
  },
];

export const ctoDeepDiveSteps: DemoStep[] = [
  {
    id: "cto-1",
    screen: "portfolio",
    title: "Portfolio Overview",
    narration: "As CTO, you see the full portfolio: 4 tenants, 14 projects, 2,447 memory artifacts accumulated. The compounding value metric shows pattern reuse is up 31% across the Ministry of Interior workspace.",
    persona: "cto",
  },
  {
    id: "cto-2",
    screen: "command",
    title: "Release Confidence Trend",
    narration: "The release confidence trend for this quarter shows a consistent upward curve. The AI context engine is getting better at predicting delivery risk as more memory artifacts accumulate.",
    persona: "cto",
  },
  {
    id: "cto-3",
    screen: "governance",
    title: "Proof Chain as Audit Evidence",
    narration: "The proof chain is your audit trail. Every approval, every evidence artifact, every AI action is recorded with a cryptographic hash. Export the full evidence pack to show any auditor exactly what happened.",
    persona: "cto",
  },
];

export const developerDeepDiveSteps: DemoStep[] = [
  {
    id: "dev-1",
    screen: "command",
    title: "Developer Dashboard",
    narration: "As a developer, the Command Center shows your active assignments, context quality score, and CI pipeline status. The context quality score tells you how much institutional memory is available for your current story.",
    persona: "developer",
  },
  {
    id: "dev-2",
    screen: "context",
    title: "Story Context Before Coding",
    narration: "Before writing a line of code, click Generate Brief. The AI compiles everything relevant: patterns from similar projects, lessons that apply, evidence you can reuse, and the governance requirements for this phase.",
    persona: "developer",
  },
  {
    id: "dev-3",
    screen: "output",
    title: "Your Output is Tracked",
    narration: "Every artifact you produce is tracked in the Output screen. The code the AI helped generate, the documentation, the API spec, and the test report are all linked to the proof chain automatically.",
    persona: "developer",
  },
];

export const complianceDeepDiveSteps: DemoStep[] = [
  {
    id: "comp-1",
    screen: "governance",
    title: "Compliance Dashboard",
    narration: "As Compliance Officer, the Governance screen shows your PDPL coverage at 98%, NCA ECC alignment at 96%, and audit readiness score. Every data processing activity is documented and linked to evidence.",
    persona: "governance",
  },
  {
    id: "comp-2",
    screen: "governance",
    title: "Evidence Export for Auditors",
    narration: "Click Evidence Export. Select PDPL template, project scope, and PDF format. Forge generates a complete compliance pack with all 12 evidence items, the approval chain, and cryptographic proof hashes.",
    action: "open-evidence-export",
    persona: "governance",
  },
  {
    id: "comp-3",
    screen: "config",
    title: "Policy Configuration",
    narration: "The Policies tab in Config Studio shows all 14 active policy rules. PDPL Personal Data Handling is set to Blocking, meaning no story can advance to Build without satisfying this control. You configure this, not developers.",
    persona: "governance",
  },
  {
    id: "operate-1",
    screen: "operate",
    title: "Incident Detection and Response",
    narration: "The Operate screen shows a critical incident on the Identity Service. Omar Al Rashid is mitigating a connection pool exhaustion issue. MTTR is 47 minutes and uptime is 99.94%.",
    persona: "devops-lead",
  },
  {
    id: "operate-2",
    screen: "operate",
    title: "Service Health Map",
    narration: "Five services are monitored in real time. Identity Service is currently degraded. Click it to filter incidents. All other services are healthy with no active issues.",
    persona: "devops-lead",
  },
  {
    id: "operate-3",
    screen: "operate",
    title: "Lesson Capture Flows to Context Hub",
    narration: "When an incident is resolved, the Capture Lesson button converts the root cause and remediation into institutional memory. This pattern is now available to every future project.",
    persona: "cto",
  },
];
