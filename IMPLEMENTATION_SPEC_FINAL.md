# Arkitekt Forge: Final Consolidated Implementation Spec

> **Purpose**: This is the single, definitive implementation guide. It merges the original IMPLEMENTATION_SPEC.md (data foundation, project creation, screen features, GitHub, output viewer, persona journeys, polish) with IMPLEMENTATION_SPEC_V2.md (story detail drawer, design artifacts, reject/rework engine, live demo apps, cross screen continuity). Hand this to Claude Code to build everything described here.
>
> **What is already built**: The data foundation (types, seed data, project templates, persona presets, demo scripts, GitHub data, output artifacts, audit trail, policy rules), all 8 screen layouts with content, the AI Agent panel, StoryTransitionDialog, ApprovalActionDialog, EvidenceExportModal, AuditTrailPanel, GitHubPanel, DemoModeOverlay, ProjectCreateWizard (Quick Start only), and Config Studio with 5 tabs. The routing, sidebar navigation, persona lens switching, and workspace selector all work.
>
> **What this spec adds**: Everything below is NEW work to be built on top of the existing codebase.
>
> **Formatting rule**: Never use dashes (hyphens, en dashes, em dashes) in any UI text, labels, or copy. Use colons, commas, or rewrite instead.
>
> **Build order**: Follow the phases in exact sequence. Each phase builds on the previous one. Test after each phase.

---

## Tech Stack (Already Configured, Do Not Change)

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Routing | wouter v3 (NOT react-router) |
| Styling | Tailwind CSS v4 (oklch colors, @theme inline) |
| Animation | framer-motion v12 |
| Charts | recharts v2 |
| Icons | lucide-react v0.453 |
| UI Components | Radix UI (dialog, tabs, dropdown, popover, switch, etc.) |
| Fonts | Manrope (body via --font-sans), Space Grotesk (display via --font-display) |
| Build | Vite |
| Toasts | sonner (already imported) |

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
```

---

# PHASE 1: DATA AND TYPE EXTENSIONS

> Add new types, seed data, and context actions needed by all subsequent phases. No UI work yet.

## 1.1 Add to `forge/types.ts`

```typescript
/* ── Story Detail Extensions (add to existing Story type) ── */

// These fields should be added to the existing Story type definition:
description: string;           // Full story description (2 to 3 sentences)
acceptanceCriteria: Array<{
  id: string;
  text: string;
  met: boolean;
}>;
agentOutputs: Record<StoryPhase, {
  sections: Array<{
    title: string;
    type: "brief" | "design_flow" | "component_diagram" | "wireframe" | "code_summary" | "test_results" | "security_scan" | "deploy_checklist" | "release_notes" | "architecture_impact";
    content: string;
    items?: string[];
    status: "draft" | "awaiting_review" | "approved" | "reworked";
    agentName: string;
    reviewedBy?: string;
  }>;
}>;
feedbackHistory: Array<{
  id: string;
  author: string;
  text: string;
  timestamp: string;
  phase: StoryPhase;
  type: "feedback" | "rejection" | "approval";
}>;

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

/* ── Governance Item Extensions (add to existing GovernanceItem type) ── */

// Add these to the existing GovernanceItem:
storyId: string;
storyTitle: string;
artifactId?: string;
artifactTitle?: string;
phaseContext: string;     // e.g. "Design phase gate"

/* ── Output Artifact Extension (add to existing OutputArtifact type) ── */

// Add this field:
previewComponent?: "citizen_auth" | "permit_dashboard";

/* ── Workflow Templates ── */

export type WorkflowTemplateKey = "standard_sdlc" | "lightweight_agile" | "enterprise_governed" | "compliance_heavy";
```

## 1.2 Create `forge/data/designArtifacts.ts`

Create 3 to 4 design artifacts per story. For "Permit Intake Brief Pack" (the default selected story), create:

1. **User Flow: Citizen Permit Application** (type: user_flow)
   Steps: "Enter National ID" → "OTP Verification" → "Select Permit Type" → "Upload Documents" → "Review and Submit" → "Receive Confirmation"
   Impacted layers: Customer Interaction, API and Integration
   Status: in_review

2. **Component Diagram: Permit Processing Pipeline** (type: component_diagram)
   Components: "Auth Gateway" (connects to: Permit Engine, Audit Logger), "Document Validator" (connects to: Permit Engine), "Permit Engine" (connects to: Notification Service, Audit Logger), "Notification Service", "Audit Logger"
   Impacted layers: Intelligence and Orchestration, Process and Governance
   Status: in_review

3. **API Contract: Permit Submission Endpoint** (type: api_contract)
   Endpoints: POST /permits (Create new permit application), GET /permits/{id} (Retrieve permit status), PATCH /permits/{id}/status (Update permit decision), GET /permits?citizen={id} (List citizen permits)
   Impacted layers: API and Integration
   Status: approved

4. **Data Model: Permit Record Schema** (type: data_model)
   Fields: permitId (string, required), citizenId (string, required), permitType (enum, required), status (enum, required), documents (file[], required), submittedAt (datetime, required), reviewedBy (string, optional), decisionDate (datetime, optional), notes (text, optional)
   Impacted layers: Data and Context
   Status: approved

Create similar artifacts for the other 3 stories. Total: 12 to 16 design artifacts.

## 1.3 Update Story Seed Data in `forge/data.ts`

For each of the 4 existing stories, add:

**description**: 2 to 3 sentences explaining the story.

**acceptanceCriteria**: 4 to 6 criteria per story, some marked as met (true), some not (false).

**agentOutputs**: Populate for all 5 phases. Each phase should have 2 to 3 sections:

Plan phase sections:
- Brief document (type: "brief"): problem statement, scope, stakeholders, success metrics
- Architecture impact (type: "architecture_impact"): which layers affected
- Agent: "Planning Agent", status: "approved" for the default story

Design phase sections:
- Design flow (type: "design_flow"): 4 to 6 step user flow
- Component diagram (type: "component_diagram"): key components and connections
- Wireframe (type: "wireframe"): screen description
- Agent: "Design Agent", status: "awaiting_review" for the default story

Develop phase sections:
- Code summary (type: "code_summary"): files changed, lines added
- Test results (type: "test_results"): pass/fail summary
- Agent: "Development Agent", status: "draft"

Test phase sections:
- Test results (type: "test_results"): full test suite results
- Security scan (type: "security_scan"): scan status
- Agent: "QA Agent", status: "draft"

Ship phase sections:
- Deploy checklist (type: "deploy_checklist"): 6 to 8 items
- Release notes (type: "release_notes"): auto generated text
- Agent: "Release Agent", status: "draft"

**feedbackHistory**: 2 to 3 entries for the default story showing a realistic conversation (feedback, approval).

## 1.4 Update Governance Seed Data

Update every governance queue item in `data.ts` to include:
- `storyId` and `storyTitle` referencing one of the 4 stories
- `artifactId` and `artifactTitle` (for design related items)
- `phaseContext` describing the gate (e.g., "Plan to Design transition gate", "Design artifact approval")

## 1.5 Extend `forge/context.tsx`

Add new state:
```typescript
const [designArtifacts, setDesignArtifacts] = useState<DesignArtifact[]>(seedDesignArtifacts);
const [storyDrawerOpen, setStoryDrawerOpen] = useState(false);
const [drawerStoryId, setDrawerStoryId] = useState<string | null>(null);
```

Add new actions:
```typescript
// Open story detail drawer from any screen
const openStoryDrawer = useCallback((storyId: string) => {
  setSelectedStoryId(storyId);
  setDrawerStoryId(storyId);
  setStoryDrawerOpen(true);
}, []);

const closeStoryDrawer = useCallback(() => {
  setStoryDrawerOpen(false);
  setDrawerStoryId(null);
}, []);

// Reject a story: revert to previous phase, trigger rework simulation
const rejectStory = useCallback((storyId: string, reason: string) => {
  const story = storyList.find(s => s.id === storyId);
  if (!story) return;
  const phases: StoryPhase[] = ["Plan", "Design", "Develop", "Test", "Ship"];
  const currentIdx = phases.indexOf(story.phase);
  if (currentIdx <= 0) return; // Cannot reject from Plan
  const previousPhase = phases[currentIdx - 1];

  // 1. Revert story phase
  setStoryList(prev => prev.map(s =>
    s.id === storyId ? { ...s, phase: previousPhase } : s
  ));

  // 2. Add feedback entry
  setStoryList(prev => prev.map(s =>
    s.id === storyId ? {
      ...s,
      feedbackHistory: [...s.feedbackHistory, {
        id: `fb-${Date.now()}`,
        author: currentUser,
        text: reason,
        timestamp: new Date().toISOString(),
        phase: story.phase,
        type: "rejection" as const,
      }]
    } : s
  ));

  // 3. Create audit event
  addAuditEvent({
    type: "state-change",
    title: `Story rejected and sent back to ${previousPhase}`,
    detail: `${story.title} moved from ${story.phase} to ${previousPhase}. Reason: ${reason}`,
    actor: currentUser,
    actorRole: activePersona,
    relatedStoryId: storyId,
  });

  // 4. Toast
  toast.info(`Story sent back to ${previousPhase}. Agent will begin rework.`);

  // 5. Trigger rework simulation
  simulateAgentRework("story", storyId, reason);
}, [storyList, currentUser, activePersona]);

// Add feedback to a story
const addStoryFeedback = useCallback((storyId: string, text: string) => {
  setStoryList(prev => prev.map(s =>
    s.id === storyId ? {
      ...s,
      feedbackHistory: [...s.feedbackHistory, {
        id: `fb-${Date.now()}`,
        author: currentUser,
        text,
        timestamp: new Date().toISOString(),
        phase: s.phase,
        type: "feedback" as const,
      }]
    } : s
  ));
  toast.success("Feedback submitted");
}, [currentUser]);

// Design artifact actions
const approveDesignArtifact = useCallback((artifactId: string, reason?: string) => {
  setDesignArtifacts(prev => prev.map(a =>
    a.id === artifactId ? { ...a, status: "approved", reviewedBy: currentUser } : a
  ));
  addAuditEvent({
    type: "approval",
    title: "Design artifact approved",
    detail: `Approved by ${currentUser}${reason ? `. Note: ${reason}` : ""}`,
    actor: currentUser,
    actorRole: activePersona,
  });
  toast.success("Design artifact approved. Governance record created.");
}, [currentUser, activePersona]);

const rejectDesignArtifact = useCallback((artifactId: string, reason: string) => {
  setDesignArtifacts(prev => prev.map(a =>
    a.id === artifactId ? { ...a, status: "rejected" } : a
  ));
  addAuditEvent({
    type: "approval",
    title: "Design artifact rejected",
    detail: `Rejected by ${currentUser}. Reason: ${reason}`,
    actor: currentUser,
    actorRole: activePersona,
  });
  toast.info("Design rejected. Agent will produce a revised version.");
  simulateAgentRework("design_artifact", artifactId, reason);
}, [currentUser, activePersona]);

const addDesignFeedback = useCallback((artifactId: string, text: string) => {
  setDesignArtifacts(prev => prev.map(a =>
    a.id === artifactId ? {
      ...a,
      feedback: [...a.feedback, {
        id: `df-${Date.now()}`,
        author: currentUser,
        text,
        timestamp: new Date().toISOString(),
        resolved: false,
      }]
    } : a
  ));
  toast.success("Feedback added to design artifact");
}, [currentUser]);

// Rework simulation engine (reusable)
const simulateAgentRework = useCallback((
  entityType: "story" | "design_artifact",
  entityId: string,
  rejectionReason: string
) => {
  // Step 1: Show agent thinking
  setAiAgentStatus("thinking");
  addNotification({
    title: "Agent reviewing rejection feedback",
    body: `Analyzing: "${rejectionReason.slice(0, 60)}..."`,
    type: "info",
  });

  // Step 2: After 2s, compiling
  setTimeout(() => setAiAgentStatus("compiling-context"), 2000);

  // Step 3: After 4s, generating
  setTimeout(() => setAiAgentStatus("generating"), 4000);

  // Step 4: After 6s, complete and update entity
  setTimeout(() => {
    setAiAgentStatus("complete");

    if (entityType === "story") {
      setStoryList(prev => prev.map(s => {
        if (s.id !== entityId) return s;
        const updated = { ...s };
        const phaseOutput = updated.agentOutputs[updated.phase];
        if (phaseOutput) {
          phaseOutput.sections = phaseOutput.sections.map(sec => ({
            ...sec,
            status: "reworked" as const,
            content: `[Reworked based on feedback] ${sec.content}`,
          }));
        }
        return updated;
      }));
    } else {
      setDesignArtifacts(prev => prev.map(a =>
        a.id === entityId ? { ...a, status: "reworked", version: a.version + 1 } : a
      ));
    }

    addNotification({
      title: "Rework complete",
      body: "Agent has completed rework. Ready for re review.",
      type: "success",
    });

    // Reset agent after 2s
    setTimeout(() => setAiAgentStatus("idle"), 2000);
  }, 6000);
}, []);
```

Update `advanceStory` to cascade:
```typescript
// When advancing a story, also:
// 1. Auto approve all "in_review" design artifacts for the completed phase
// 2. Resolve governance queue items for the completed phase
// 3. Add new governance items for the next phase gates
// 4. Add memory events to Context Hub
// 5. Make related output artifacts available
```

**Expose all new state and actions in the context value object.**

**Test**: App compiles. All existing screens still render. No runtime errors.

---

# PHASE 2: STORY DETAIL DRAWER AND REJECT/REWORK FLOW

> This is the most important interaction pattern. It establishes the human in the loop feedback cycle that is the core value proposition.

## 2.1 New Component: `forge/components/StoryDetailDrawer.tsx`

A slide over drawer from the right (560px wide) using Radix `Sheet` or `Dialog` with custom positioning. Opens when clicking any story card anywhere in the app.

**Layout (top to bottom):**

```
┌─────────────────────────────────────────────┐
│  STORY DETAIL                          [X]  │
│  ─────────────────────────────────────────── │
│  Story Title (H2, font-display)             │
│  Owner: Maha Noor  ·  Phase: Plan           │
│  Risk: Medium  ·  Confidence: 72%           │
│  ─────────────────────────────────────────── │
│                                             │
│  [Plan] [Design] [Develop] [Test] [Ship]    │
│     ●───────●───────○───────○───────○       │
│  (filled = completed, ring = current, empty)│
│                                             │
│  DESCRIPTION                                │
│  Full story description text...             │
│                                             │
│  ACCEPTANCE CRITERIA                        │
│  ✓ Criterion 1 (green text if met)         │
│  ✓ Criterion 2                             │
│  ○ Criterion 3 (slate text if not met)     │
│                                             │
│  AGENT OUTPUT FOR THIS PHASE                │
│  ┌─────────────────────────────────────┐    │
│  │ Section title                        │    │
│  │ Content text...                      │    │
│  │ Agent badge: "Generated by X Agent"  │    │
│  │ Status badge (ReworkBadge component) │    │
│  └─────────────────────────────────────┘    │
│  (repeat for each section in current phase) │
│                                             │
│  FEEDBACK                                   │
│  ┌─────────────────────────────────────┐    │
│  │ Previous feedback entries (scrollable│    │
│  │ list with author, timestamp, text)   │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ [textarea: Type your feedback...]   │    │
│  └─────────────────────────────────────┘    │
│  [Send Feedback]                            │
│                                             │
│  TRANSITION HISTORY                         │
│  (list of StoryTransition entries)          │
│                                             │
│  ─────────────────────────────────────────── │
│  [Approve & Advance]     [Reject & Rework]  │
└─────────────────────────────────────────────┘
```

**"Approve & Advance"**: Opens existing StoryTransitionDialog.
**"Reject & Rework"**: Opens StoryRejectDialog (new, see 2.2).
**"Send Feedback"**: Calls addStoryFeedback from context.

The drawer must be accessible from every screen via `openStoryDrawer(storyId)` from context. Screens that should trigger it:
- DeliveryFlow: clicking a story card
- CommandCenter: clicking the story spotlight card
- ContextHub: clicking a memory event that references a story
- Governance: clicking a story title in the approval queue

## 2.2 New Component: `forge/components/StoryRejectDialog.tsx`

A Radix Dialog modal:

```
┌─────────────────────────────────────────────┐
│  REJECT AND SEND BACK                       │
│                                             │
│  Story: {story.title}                       │
│  Current phase: {story.phase}               │
│  Will be sent back to: {previousPhase}      │
│                                             │
│  REASON FOR REJECTION (required)            │
│  ┌─────────────────────────────────────┐    │
│  │ [textarea]                          │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  WHAT HAPPENS NEXT                          │
│  The AI agent will automatically pick up    │
│  this story, review your feedback, and      │
│  produce an updated deliverable. You will   │
│  receive a notification when the rework     │
│  is ready for your review.                  │
│                                             │
│  [Cancel]              [Confirm Rejection]  │
└─────────────────────────────────────────────┘
```

On confirm: calls `rejectStory(storyId, reason)` from context.

## 2.3 New Component: `forge/components/ReworkBadge.tsx`

A small reusable badge component:

```typescript
type ReworkBadgeProps = {
  status: "draft" | "awaiting_review" | "approved" | "rejected" | "reworked" | "reworking";
  version?: number;
};
```

Renders:
- "draft" → slate badge: "Draft"
- "awaiting_review" → amber badge: "Awaiting Review"
- "approved" → green badge: "Approved"
- "rejected" → red badge: "Rejected"
- "reworked" → blue badge: "Reworked · v{version}"
- "reworking" → animated badge with pulse: "Agent Reworking..."

Use this badge on: story cards in Delivery Flow kanban, design artifact cards in Architecture, approval queue items in Governance, agent output sections in Story Detail Drawer.

## 2.4 Update `forge/screens/DeliveryFlow.tsx`

- When clicking a story card, also call `openStoryDrawer(storyId)` (keep existing selection logic)
- Add `ReworkBadge` to story cards when `story.agentOutputs[story.phase]?.sections?.some(s => s.status === "reworked")`
- Add feedback count indicator on story cards (show icon with count if `story.feedbackHistory.length > 0`)
- Add gate status pill on story cards at phase boundaries: "Gate: Open" (green) or "Gate: Blocked" (amber)

**Test**: Click any story card in Delivery Flow. Drawer opens showing full detail. Can submit feedback. Can reject a story and see it move back on the kanban board. After 6 seconds, the rework completes and a notification appears.

---

# PHASE 3: DESIGN ARTIFACTS AND ARCHITECTURE LINKAGE

> Connect the Design phase to Architecture with reviewable, approvable design artifacts.

## 3.1 New Component: `forge/components/DesignArtifactCard.tsx`

A card that renders design artifacts visually based on type.

**User flow rendering** (type: "user_flow"):
Horizontal connected step cards with arrow connectors:
```
[Step 1] ──→ [Step 2] ──→ [Step 3] ──→ [Step 4]
  Label        Label        Label        Label
```
Use flexbox with styled arrow dividers. Each step is a rounded card with the label bold and description in smaller text below.

**Component diagram rendering** (type: "component_diagram"):
Grid of component cards (2 or 3 columns). Each card shows:
- Component name (bold)
- Description (small text)
- "Connects to:" list (badge pills listing connected components)

**API contract rendering** (type: "api_contract"):
Table rows with method badges:
```
[POST]   /permits              Create new permit application
[GET]    /permits/{id}         Retrieve permit status
[PATCH]  /permits/{id}/status  Update permit decision
```
Method badge colors: GET=emerald, POST=sky, PATCH=amber, DELETE=red. Use rounded pills for methods.

**Data model rendering** (type: "data_model"):
Field rows:
```
permitId     [string]    [required]
citizenId    [string]    [required]
documents    [file[]]    [required]
status       [enum]      [required]
reviewedBy   [string]    [optional]
```
Type in a sky pill, required/optional in green/slate pill.

## 3.2 New Component: `forge/components/DesignArtifactModal.tsx`

A full screen modal (Radix Dialog) for viewing a design artifact in detail:

- Top: title, type badge, status badge (ReworkBadge), version number, story link
- Center: full rendered design artifact (using DesignArtifactCard)
- Right side or below: feedback thread (existing comments with author, timestamp, text)
- Feedback input textarea with "Submit Feedback" button
- Bottom action bar: [Approve Design] [Reject and Rework]

"Approve Design" calls `approveDesignArtifact`.
"Reject and Rework" opens a dialog requiring reason, then calls `rejectDesignArtifact`.

## 3.3 Update `forge/screens/ArchitectureScreen.tsx`

Add a new section between "Service impact map" and "Design rationale" titled **"Design Artifacts Under Review"**:

```
DESIGN ARTIFACTS UNDER REVIEW
These artifacts were generated for: [Story: {title}] (clickable, opens drawer)

┌──────────────────────────────────────────┐
│ User Flow: Citizen Permit Application     │
│ [In Review] · Version 1 · Design Agent    │
│ Impacted: Customer Interaction, API       │
│                                           │
│ [View Full Design]  [Approve] [Reject]    │
└──────────────────────────────────────────┘

(repeat for each in_review/reworked artifact for selected story)
```

- Filter `designArtifacts` from context by `selectedStory.id`
- Show only artifacts with status "in_review" or "reworked"
- "View Full Design" opens DesignArtifactModal
- "Approve" calls approveDesignArtifact directly
- "Reject" opens a small dialog for reason, then calls rejectDesignArtifact

## 3.4 Update `forge/screens/GovernanceScreen.tsx`

Each approval queue item must now show contextual information:

- **Story pill**: "{storyTitle}" (clickable, opens story drawer)
- **Artifact pill** (if design related): "{artifactTitle} v{version}" (clickable, opens DesignArtifactModal)
- **Phase context**: "{phaseContext}" (e.g., "Design to Develop transition gate")

When rejecting a governance item that has an `artifactId`, also call `rejectDesignArtifact`. When rejecting one that has a `storyId`, add a feedback entry to that story.

**Test**: Architecture screen shows design artifacts for the selected story. Can view, approve, and reject designs. Rejecting triggers a visible 6 second rework simulation. Governance items show which story and artifact they relate to.

---

# PHASE 4: LIVE DEMO APPS IN OUTPUT SCREEN

> Replace the placeholder live preview with interactive mini applications.

## 4.1 New Component: `forge/previews/CitizenAuthPreview.tsx`

A realistic Saudi government style authentication screen rendered inline:

**Visual design:**
- White background, dark navy (#1B2A4A) header bar
- "National Digital Permits Platform" title
- "Ministry of Interior" subtitle
- Saudi green accents (#006C35)
- "PDPL Compliant" and "NCA ECC Aligned" badges at the bottom
- "GCP me-central2 (Dammam, Saudi Arabia)" text
- Arabic text: "مرحبا بكم" (welcome) as decorative element

**Interactive flow (all local React state, no backend):**
1. Screen shows National ID input field (accepts any 10 digits)
2. User types a number and clicks "Send OTP"
3. OTP input appears: 6 separate boxes (accepts any 6 digits)
4. User types OTP and submits → "Verifying..." spinner for 1 second
5. Success state: green checkmark, "Welcome, Citizen" message
6. After success, shows a simple permit list (3 permits with status badges: Approved, Pending, Under Review)
7. Also show: "Absher" and "National SSO" alternative auth buttons (decorative, show toast on click)

## 4.2 New Component: `forge/previews/PermitDashboardPreview.tsx`

A permit management dashboard:

**Layout:**
- 4 KPI cards: Total (247), Pending (18), Approved (214), Rejected (15)
- "Recent Applications" table with 5 rows
- Each row: permit number, type, date, status badge
- "Create New Permit" button
- Clicking "Create New Permit" shows an inline form: permit type dropdown, description field, submit button
- Submitting adds a row to the table with "Pending" status and shows toast
- Clicking a row shows a simple timeline: Submitted → Under Review → Decision

## 4.3 Update `forge/screens/OutputScreen.tsx`

Replace the `LivePreviewViewer` function body:

```typescript
function LivePreviewViewer({ artifact }: { artifact: OutputArtifact }) {
  switch (artifact.previewComponent) {
    case "citizen_auth":
      return <CitizenAuthPreview />;
    case "permit_dashboard":
      return <PermitDashboardPreview />;
    default:
      return (
        <div className="flex h-full flex-col items-center justify-center ...">
          {/* Keep existing placeholder for artifacts without previewComponent */}
        </div>
      );
  }
}
```

## 4.4 Add Specialized Artifact Viewers

Add viewer components for artifact types that currently fall through to empty state:

**DiagramViewer**: For type "diagram". Render a static but professional looking architecture diagram using styled divs and SVG arrows. Show 8 layers from v11 architecture as stacked horizontal bars with the story's impacted layers highlighted.

**ApiSpecViewer**: For type "api-spec". Render endpoint table with method badges (same style as DesignArtifactCard API contract rendering). Add "Base URL" header and auth method badge.

**TestReportViewer**: For type "test-report". Render a table with test name, status (pass=green/fail=red badge), duration. Show summary bar at top: "47 passed, 2 failed, 1 skipped". Coverage percentage with progress bar.

Update the `ArtifactViewer` component to route these types to the appropriate viewer.

## 4.5 Update Output Artifact Seed Data

Update the existing output artifacts to include `previewComponent` on the live preview items:
- Set `previewComponent: "citizen_auth"` on the Citizen Authentication Portal artifact
- Set `previewComponent: "permit_dashboard"` on the Permit Dashboard artifact (create this artifact if it does not exist)

**Test**: Output screen shows interactive mini apps when selecting live preview artifacts. Citizen auth flow works end to end. Permit dashboard allows creating new permits. Diagram, API spec, and test report viewers render properly.

---

# PHASE 5: ADVANCED SETUP WIZARD AND PERSONA BUILDER

> The Quick Start wizard works. Build the Advanced Setup and Persona Builder.

## 5.1 Update `forge/components/ProjectCreateWizard.tsx`

Replace the "Advanced Setup" placeholder with a real 6 step stepper.

**Stepper component**: Horizontal bar at the top showing 6 numbered circles connected by lines. Active step is filled (bg-slate-950), completed steps have checkmarks, upcoming steps are outlined.

**Step 1: Identity**
- Project name (text input)
- Description (textarea)
- Owner (dropdown of team members)
- Project type grid (same 9 types as Quick Start)

**Step 2: Workflow**
- Shows the selected project type's default phases as horizontal cards
- Each phase card is editable: rename, add states
- "Add Phase" and "Remove Phase" buttons
- Gate configuration: for each phase transition, set required approvers count and approver roles (dropdown)

**Step 3: Connectors**
- Marketplace grid filtered for the selected project type (recommended connectors pre checked)
- Toggle on/off for each connector
- Category filter bar

**Step 4: Personas**
- Preset grid with checkboxes (recommended personas pre checked)
- "Create Custom Persona" button (opens PersonaBuilderDialog)
- Selected personas show as pills below the grid

**Step 5: Governance**
- Posture selector: Standard / Enhanced / Maximum (radio cards with descriptions)
- Compliance toggles: PDPL, NCA ECC, SOC2, ISO 27001, NDMO (checkboxes)
- Evidence level per phase: None / Summary / Full (dropdown per phase)

**Step 6: Review**
- Full summary of all choices organized in sections
- Estimated complexity score (calculated from phases, gates, connectors)
- "Launch Project" button with animation

Navigation: "Back" and "Next" buttons. "Next" validates required fields before advancing.

## 5.2 New Component: `forge/components/PersonaBuilderDialog.tsx`

A Radix Dialog for creating/editing custom personas:

- Name (text input)
- Role title (text input)
- Icon picker: grid of 12 to 15 lucide icons (Crown, Shield, Code, etc.) with click to select
- Dashboard widget selector: checkbox grid of DashboardWidget values, drag to reorder (or numbered priority)
- Metric priorities: sortable list of 4 to 6 metrics
- Notification filters: checkboxes
- Action permissions: checkboxes
- Preview panel: small card showing how Command Center would look (just the widget titles in a grid layout)
- "Save Persona" button calls `createCustomPersona` from context

## 5.3 New Component: `forge/components/ConnectorSetupWizard.tsx`

A 3 step dialog for connecting a new connector:

**Step 1: Configure**
- Connector name and icon (read only, from connector data)
- API endpoint field (pre filled placeholder)
- API key / credentials field (masked input with placeholder)
- Region selector (if applicable)

**Step 2: Authorize**
- "Authorize" button that triggers a simulated OAuth flow
- Button changes to spinner, then checkmark after 2 seconds
- Status: "Authorization successful"

**Step 3: Test Connection**
- "Test Connection" button
- Progress animation (3 test steps: connectivity, authentication, data sync)
- Each step shows checkmark on complete
- After 3 seconds: "Connection verified. Ready to use."
- On complete: connector status flips to "Connected", audit event created, toast shown

## 5.4 New Component: `forge/components/StoryCreateDialog.tsx`

A Radix Dialog for creating a new story:

- Title (text input)
- Summary (textarea)
- Owner (dropdown)
- Risk level (Low/Medium/High radio)
- Starting phase: defaults to Plan
- "Create Story" button adds to storyList via context, navigates to Delivery Flow

Add a "Create Story" button in the Delivery Flow header area.

## 5.5 Update Config Studio

**Workflow tab**: Add 4 template preset buttons above the canvas: "Standard SDLC", "Lightweight Agile", "Enterprise Governed", "Compliance Heavy". Clicking a preset rearranges the workflow nodes with a framer motion animation (nodes smoothly move to new positions).

**Personas tab**: Add "Create Custom Persona" button at the top. Opens PersonaBuilderDialog. Show custom personas alongside presets with a "Custom" badge.

**Connectors tab**: When clicking an "Available" connector, open ConnectorSetupWizard instead of toggling directly.

**Test**: Advanced Setup wizard lets you step through all 6 steps. Persona Builder creates a custom persona that appears in the Config Studio personas tab. Connector setup wizard walks through 3 steps.

---

# PHASE 6: CROSS SCREEN CONTINUITY AND MISSING WIDGETS

> Make state changes visible across all screens.

## 6.1 Cross Screen Event Propagation

Update `advanceStory` in context to cascade:
```
When story advances from Phase X to Phase Y:
1. All design artifacts for that story with status "in_review" → "approved"
2. Governance queue items for Phase X → marked "resolved"
3. New governance items for Phase Y gates → added to queue
4. Output artifacts for Phase X become available
5. Memory event added: "Story {title} completed {Phase X}. Patterns retained."
6. Notification: "Story {title} advanced to {Phase Y}" with actionUrl to Delivery Flow
```

Update `rejectStory` to cascade:
```
When story rejected from Phase X to Phase X-1:
1. Design artifacts for that story with status "in_review" → "rejected"
2. Governance queue items for Phase X → marked "Returned for rework"
3. After rework simulation completes: artifacts → "reworked", governance → "Re review required"
4. Memory event: "Story {title} rejected at {Phase X}. Feedback captured."
5. Notification with actionUrl
```

## 6.2 Notification Enhancements

Update notification items to include an `actionUrl` field. When clicking a notification, navigate to that URL.

Add notification types for:
- Story advancement
- Design artifact approved/rejected
- Rework complete
- Evidence pack exported
- New memory pattern detected

## 6.3 GitHub Integration Enhancements

**Architecture screen**: Add "Repository" collapsible section with file tree browser. Use existing `GitHubFileNode` data. Render as collapsible folders (click to expand/collapse) with file icons and links.

**Command Center**: Add "Repository Activity" widget for Developer and DevOps personas. Show: Open PRs count, commits today count, CI pipeline status, branch count.

**GitHub URL fix**: In `githubData.ts`, ensure `GITHUB_ORG = "TheArkitektai"` and `GITHUB_REPO = "Forge"` and all URLs use `https://github.com/TheArkitektai/Forge`.

## 6.4 Context Hub Rework Memory Events

Add 2 to 3 seed memory events related to past rejections/reworks:
- "API contract v1 was rejected because it exposed PII in query parameters. Agent corrected to use request body. This pattern is now stored for future projects." (type: "Lesson learned")
- "Authentication flow was reworked to add biometric fallback after architect review. The updated pattern has been adopted by 3 other projects." (type: "Pattern reuse")

## 6.5 Compliance Dashboard in Governance

Add a "Compliance Posture" section to GovernanceScreen showing:
- PDPL coverage: percentage bar (e.g., 94%)
- NCA ECC alignment: percentage bar (e.g., 87%)
- Audit readiness score: radial gauge (e.g., 91%)
- "PDPL Compliant" badge (green shield)
- "NCA ECC Aligned" badge

**Test**: Advance a story in Delivery Flow. Check that Architecture design artifacts auto approve, Governance items resolve, Context Hub gets a memory event, and a notification appears. Reject a design in Architecture and verify the rework flows to Governance and Delivery Flow.

---

# PHASE 7: PERSONA ADAPTIVE LAYOUTS

> Make each persona see a different Command Center and different filtered views.

## 7.1 Persona Adaptive Command Center

Add `personaWidgetLayouts` to Command Center:

```typescript
const personaWidgetLayouts: Record<PersonaKey, { main: string[]; sidebar: string[] }> = {
  "cto": {
    main: ["portfolio-kpis", "release-confidence-trend", "compounding-value"],
    sidebar: ["proof-chain-gauge", "governance-queue"],
  },
  "delivery-lead": {
    main: ["phase-distribution", "story-spotlight", "active-assignments"],
    sidebar: ["release-confidence-trend", "persona-metrics"],
  },
  "solution-architect": {
    main: ["architecture-impact", "story-spotlight", "cross-project-dependencies"],
    sidebar: ["context-quality", "proof-chain-gauge"],
  },
  "developer": {
    main: ["active-assignments", "context-quality", "ci-pipeline-status"],
    sidebar: ["story-spotlight", "persona-metrics"],
  },
  "qa-lead": {
    main: ["test-coverage-matrix", "ci-pipeline-status", "story-spotlight"],
    sidebar: ["phase-distribution", "persona-metrics"],
  },
  "security-officer": {
    main: ["security-scan-results", "compliance-dashboard", "governance-queue"],
    sidebar: ["proof-chain-gauge", "persona-metrics"],
  },
  "compliance-officer": {
    main: ["compliance-dashboard", "governance-queue", "proof-chain-gauge"],
    sidebar: ["phase-distribution", "persona-metrics"],
  },
  "product-owner": {
    main: ["priority-matrix", "story-spotlight", "phase-distribution"],
    sidebar: ["compounding-value", "persona-metrics"],
  },
  "devops-lead": {
    main: ["ci-pipeline-status", "active-assignments", "cost-dashboard"],
    sidebar: ["story-spotlight", "persona-metrics"],
  },
  "programme-director": {
    main: ["portfolio-kpis", "cross-project-dependencies", "compounding-value"],
    sidebar: ["release-confidence-trend", "governance-queue"],
  },
};
```

Build each widget as a small component. Not all need to be fully functional for the demo: some can be well designed static cards with realistic data. The key widgets that must be interactive: story-spotlight (clickable, opens drawer), governance-queue (shows approve/reject), ci-pipeline-status (shows pass/fail badges).

When `activePersona` changes, the Command Center re renders with the new layout.

## 7.2 Persona Aware Filtering

**Delivery Flow**: Add a "My Stories" toggle button. When active, filter stories to those where `story.owner` matches the current persona's typical owner or where `story.personaActions[activePersona]` has entries.

**Governance**: Filter approval queue to show only items where the current persona's `actionPermissions` include the relevant action.

**Context Hub**: Reorder memory events based on the active persona's `memoryFeedOrder`.

**Architecture**: Add a subtle highlight (sky border) on architecture layer cards that the current persona is responsible for.

## 7.3 DemoModeOverlay Auto Advance

Add an "Auto advance" toggle switch to the DemoModeOverlay. When enabled, steps advance automatically every 8 seconds with a progress bar.

**Test**: Switch personas and verify Command Center changes layout. Delivery Flow "My Stories" toggle works. Auto advance demo runs hands free.

---

# PHASE 8: POLISH AND BRANDING

## 8.1 Saudi Market Branding

- "GCP me-central2 (Dammam, Saudi Arabia)" deployment region display in Portfolio summary strip
- Arabic placeholder text in the live preview components ("مرحبا بكم", "النظام الرقمي الوطني للتصاريح")
- Saudi green (#006C35) accents in the Citizen Auth preview
- Regulatory badges: "PDPL Compliant" (green shield) in Governance header, "NCA ECC Aligned" in Portfolio, "NDMO Ready" in Config Studio

## 8.2 Toast Notifications (Systematic Wiring)

Wire toast notifications (sonner) to ALL state changing actions. Every action should produce a toast:
- Story transitions: "Story moved to {phase}."
- Approvals: "{item} approved by {persona}."
- Rejections: "{item} rejected. Agent will rework."
- Rework complete: "Rework complete on {item}."
- AI completions: "Agent analysis complete. {confidence}% confidence."
- Connector events: "{connector} connected successfully."
- Evidence exports: "Evidence pack generated."
- Feedback: "Feedback submitted."
- Project creation: "Project {name} created."

## 8.3 Animation Polish

- Story drawer: slide in from right with spring animation (framer motion)
- Rework badge "reworking" state: pulse animation
- Design artifact cards: subtle scale animation on status change
- Wizard stepper: horizontal slide between steps
- Live preview transitions: fade in on state changes
- Skeleton loading states during screen transitions (already partially implemented)

## 8.4 Responsive Layout

Verify all screens on iPad Pro (1024x1366). Sidebar should collapse to icons on smaller screens. Story drawer should take full width on mobile. Cards should stack vertically.

---

# FILE CREATION CHECKLIST

## New files to create:
```
forge/
├── data/
│   └── designArtifacts.ts          # 12 to 16 design artifacts
├── components/
│   ├── StoryDetailDrawer.tsx       # Slide over drawer with full story detail
│   ├── StoryRejectDialog.tsx       # Rejection with reason + rework trigger
│   ├── ReworkBadge.tsx             # Reusable status badge component
│   ├── DesignArtifactCard.tsx      # Visual renderers for 5 artifact types
│   ├── DesignArtifactModal.tsx     # Full view + feedback + approve/reject
│   ├── DesignRejectDialog.tsx      # Design rejection dialog
│   ├── PersonaBuilderDialog.tsx    # Custom persona creation/editing
│   ├── ConnectorSetupWizard.tsx    # 3 step connection flow
│   ├── StoryCreateDialog.tsx       # New story creation form
│   ├── DiagramViewer.tsx           # Architecture diagram viewer
│   ├── ApiSpecViewer.tsx           # OpenAPI endpoint table viewer
│   ├── TestReportViewer.tsx        # Test results table viewer
│   └── DemoAppPreview.tsx          # Container for live preview routing
└── previews/
    ├── CitizenAuthPreview.tsx      # Interactive auth flow mini app
    └── PermitDashboardPreview.tsx  # Interactive permit dashboard mini app
```

## Files to modify:
```
forge/types.ts                     # Add Story extensions, DesignArtifact, GovernanceItem extensions, OutputArtifact.previewComponent
forge/data.ts                      # Add story descriptions, acceptance criteria, agent outputs, feedback, update governance items
forge/context.tsx                  # Add rejectStory, addStoryFeedback, designArtifacts state, approveDesignArtifact, rejectDesignArtifact, addDesignFeedback, simulateAgentRework, openStoryDrawer, update advanceStory cascading
forge/screens/DeliveryFlow.tsx     # Integrate StoryDetailDrawer, ReworkBadge, feedback count, gate status, StoryCreateDialog button
forge/screens/ArchitectureScreen.tsx # Add Design Artifacts Under Review section, GitHub file tree
forge/screens/GovernanceScreen.tsx # Add story/artifact refs to queue items, compliance dashboard section
forge/screens/OutputScreen.tsx     # Replace LivePreviewViewer, add DiagramViewer, ApiSpecViewer, TestReportViewer
forge/screens/CommandCenter.tsx    # Persona adaptive widget layouts, repository activity widget
forge/screens/ContextHub.tsx       # Add rework memory events
forge/screens/ConfigStudio.tsx     # Workflow template presets, ConnectorSetupWizard integration, PersonaBuilderDialog
forge/components/ProjectCreateWizard.tsx # Replace Advanced Setup placeholder with 6 step stepper
forge/components/DemoModeOverlay.tsx     # Add auto advance toggle
forge/data/githubData.ts           # Fix repo URL to TheArkitektai/Forge
```

---

# BUILD ORDER

Execute in this exact sequence. Test after each phase.

1. **Phase 1** (Data): Types, design artifacts, story extensions, governance references, context actions. **Test: app compiles, no runtime errors.**

2. **Phase 2** (Story Drawer + Rework): StoryDetailDrawer, StoryRejectDialog, ReworkBadge, DeliveryFlow integration. **Test: click story → drawer opens → can give feedback → can reject → rework simulation runs → notification appears.**

3. **Phase 3** (Design + Architecture): DesignArtifactCard, DesignArtifactModal, Architecture update, Governance update. **Test: Architecture shows design artifacts → can approve/reject → Governance shows story context.**

4. **Phase 4** (Output): CitizenAuthPreview, PermitDashboardPreview, DiagramViewer, ApiSpecViewer, TestReportViewer. **Test: Output screen shows interactive apps and proper viewers for all artifact types.**

5. **Phase 5** (Wizard + Builder): Advanced Setup 6 step stepper, PersonaBuilderDialog, ConnectorSetupWizard, StoryCreateDialog. **Test: can create project via Advanced Setup → can create custom persona → can connect a connector via 3 step wizard.**

6. **Phase 6** (Continuity): Cross screen cascading, notifications with actionUrl, GitHub enhancements, compliance dashboard. **Test: advance a story and verify changes propagate to Architecture, Governance, Context Hub.**

7. **Phase 7** (Persona): Adaptive Command Center, My Stories toggle, persona filtering, auto advance. **Test: switch personas → Command Center layout changes → Delivery Flow filters.**

8. **Phase 8** (Polish): Saudi branding, toast wiring, animations, responsive. **Test: full demo runs smoothly end to end.**

---

# CRITICAL RULES

1. **No backend calls.** Everything is local state and seed data.
2. **No dashes** in any UI text, labels, descriptions, or copy. Use colons, commas, or restructure the sentence.
3. **Match the design system exactly.** Use the card styles, font classes, and color patterns from existing screens.
4. **Use existing UI components.** The project has 50+ shadcn/Radix components ready to use.
5. **Use framer motion** for all animations.
6. **Use recharts** for all charts.
7. **Use wouter** for routing (NOT react-router).
8. **Use lucide react** for all icons.
9. **Every state change creates an audit trail event.**
10. **Every state change shows a toast** (sonner).
11. **Rework simulation must be visible.** The AI agent status must cycle through thinking → compiling → generating → complete (6 seconds total).
12. **All reject actions require a reason.** The textarea is required.
13. **Cross screen links must work.** Clicking a story title in Governance navigates to Delivery Flow with that story selected and drawer open.
14. **Design artifacts must visually render.** Not just text. Flows show step cards. Diagrams show component grids. API contracts show endpoint tables.
15. **Live preview mini apps must be interactive.** Users can type, click, and see state changes. This is the WOW moment.
16. **GitHub repo is `https://github.com/TheArkitektai/Forge`**. All GitHub URLs must use this.
17. **Test after each phase.** The app must compile and render correctly before moving on.
