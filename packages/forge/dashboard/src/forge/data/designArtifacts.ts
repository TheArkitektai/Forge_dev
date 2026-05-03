import { DesignArtifact } from "@/forge/types";

export const designArtifacts: DesignArtifact[] = [
  /* ── permit-intake ── */
  {
    id: "da-permit-flow",
    storyId: "permit-intake",
    storyTitle: "Permit Intake Brief Pack",
    title: "User Flow: Citizen Permit Application",
    type: "user_flow",
    status: "in_review",
    createdBy: "Design Agent",
    impactedLayers: ["Customer Interaction", "API and Integration"],
    impactedServices: ["Auth Gateway", "Permit Engine", "Notification Service"],
    content: {
      description:
        "End to end flow for a citizen applying for a permit via the national digital platform",
      steps: [
        {
          id: "s1",
          label: "Enter National ID",
          description: "Citizen enters their 10 digit national ID number",
        },
        {
          id: "s2",
          label: "OTP Verification",
          description: "One time password sent to registered mobile",
        },
        {
          id: "s3",
          label: "Select Permit Type",
          description: "Citizen selects the applicable permit category from a list",
        },
        {
          id: "s4",
          label: "Upload Documents",
          description: "Required supporting documents uploaded and validated",
        },
        {
          id: "s5",
          label: "Review and Submit",
          description: "Citizen reviews all details and submits the application",
        },
        {
          id: "s6",
          label: "Receive Confirmation",
          description: "Application reference number and estimated timeline issued",
        },
      ],
    },
    feedback: [
      {
        id: "fb1",
        author: "Sara Malik",
        text: "Step 3 should show estimated processing time per permit type",
        timestamp: "2 hours ago",
        resolved: false,
      },
    ],
    version: 1,
  },
  {
    id: "da-permit-components",
    storyId: "permit-intake",
    storyTitle: "Permit Intake Brief Pack",
    title: "Component Diagram: Permit Processing Pipeline",
    type: "component_diagram",
    status: "in_review",
    createdBy: "Design Agent",
    impactedLayers: ["Intelligence and Orchestration", "Process and Governance"],
    impactedServices: [
      "Auth Gateway",
      "Document Validator",
      "Permit Engine",
      "Notification Service",
      "Audit Logger",
    ],
    content: {
      description:
        "Core service components and their interactions in the permit processing pipeline",
      components: [
        {
          name: "Auth Gateway",
          description: "Validates citizen identity via Nafath SSO",
          connections: ["Permit Engine", "Audit Logger"],
        },
        {
          name: "Document Validator",
          description: "Checks uploaded documents for format and completeness",
          connections: ["Permit Engine"],
        },
        {
          name: "Permit Engine",
          description: "Orchestrates permit lifecycle and decision routing",
          connections: ["Notification Service", "Audit Logger"],
        },
        {
          name: "Notification Service",
          description: "Sends status updates to applicants via SMS and email",
          connections: [],
        },
        {
          name: "Audit Logger",
          description: "Records all state transitions for governance trace",
          connections: [],
        },
      ],
    },
    feedback: [],
    version: 1,
  },
  {
    id: "da-permit-api",
    storyId: "permit-intake",
    storyTitle: "Permit Intake Brief Pack",
    title: "API Contract: Permit Submission Endpoint",
    type: "api_contract",
    status: "approved",
    createdBy: "Design Agent",
    reviewedBy: "Sara Malik",
    impactedLayers: ["API and Integration"],
    impactedServices: ["Permit Engine"],
    content: {
      description: "REST endpoints for submitting and tracking permit applications",
      endpoints: [
        { method: "POST", path: "/permits", description: "Create new permit application" },
        {
          method: "GET",
          path: "/permits/{id}",
          description: "Retrieve permit status and details",
        },
        {
          method: "PATCH",
          path: "/permits/{id}/status",
          description: "Update permit decision by reviewer",
        },
        {
          method: "GET",
          path: "/permits",
          description: "List all permits for the authenticated citizen",
        },
      ],
    },
    feedback: [],
    version: 1,
  },
  {
    id: "da-permit-model",
    storyId: "permit-intake",
    storyTitle: "Permit Intake Brief Pack",
    title: "Data Model: Permit Record Schema",
    type: "data_model",
    status: "approved",
    createdBy: "Design Agent",
    reviewedBy: "Sara Malik",
    impactedLayers: ["Data and Context"],
    impactedServices: ["Permit Engine", "Audit Logger"],
    content: {
      description:
        "Core data fields for a permit application record stored in the platform",
      fields: [
        { name: "permitId", type: "string", required: true },
        { name: "citizenId", type: "string", required: true },
        { name: "permitType", type: "enum", required: true },
        { name: "status", type: "enum", required: true },
        { name: "documents", type: "file[]", required: true },
        { name: "submittedAt", type: "datetime", required: true },
        { name: "reviewedBy", type: "string", required: false },
        { name: "decisionDate", type: "datetime", required: false },
        { name: "notes", type: "text", required: false },
      ],
    },
    feedback: [],
    version: 1,
  },

  /* ── identity ── */
  {
    id: "da-identity-flow",
    storyId: "identity",
    storyTitle: "Citizen Identity Verification",
    title: "User Flow: Citizen Identity Verification",
    type: "user_flow",
    status: "in_review",
    createdBy: "Design Agent",
    impactedLayers: ["Customer Interaction", "API and Integration"],
    impactedServices: ["Identity Service", "Nafath SSO", "Audit Graph"],
    content: {
      description:
        "Step by step citizen authentication flow using Nafath identity provider with PDPL consent management",
      steps: [
        {
          id: "s1",
          label: "Access Service",
          description: "Citizen navigates to the digital service portal",
        },
        {
          id: "s2",
          label: "Consent Screen",
          description: "PDPL consent presented and accepted by citizen",
        },
        {
          id: "s3",
          label: "Identity Prompt",
          description: "System requests Nafath verification",
        },
        {
          id: "s4",
          label: "Nafath Confirmation",
          description: "Citizen confirms identity via Nafath mobile app",
        },
        {
          id: "s5",
          label: "Access Granted",
          description: "Session established and audit event recorded",
        },
      ],
    },
    feedback: [],
    version: 1,
  },
  {
    id: "da-identity-components",
    storyId: "identity",
    storyTitle: "Citizen Identity Verification",
    title: "Component Diagram: Identity Service Architecture",
    type: "component_diagram",
    status: "approved",
    createdBy: "Design Agent",
    reviewedBy: "Omar Rahman",
    impactedLayers: ["Module System", "Process and Governance"],
    impactedServices: ["Identity Service", "Policy Engine", "Audit Graph"],
    content: {
      description:
        "Service architecture for the citizen identity verification module",
      components: [
        {
          name: "Identity Service",
          description: "Core verification orchestration with Nafath integration",
          connections: ["Policy Engine", "Audit Graph"],
        },
        {
          name: "Policy Engine",
          description: "Applies PDPL rules and residency check logic",
          connections: ["Audit Graph"],
        },
        {
          name: "Audit Graph",
          description: "Retains consent and approval lineage as proof events",
          connections: [],
        },
      ],
    },
    feedback: [],
    version: 1,
  },
  {
    id: "da-identity-api",
    storyId: "identity",
    storyTitle: "Citizen Identity Verification",
    title: "API Contract: Identity Verification Endpoints",
    type: "api_contract",
    status: "approved",
    createdBy: "Design Agent",
    reviewedBy: "Sara Malik",
    impactedLayers: ["API and Integration"],
    impactedServices: ["Identity Service"],
    content: {
      description:
        "REST endpoints for initiating and checking citizen identity verification status",
      endpoints: [
        {
          method: "POST",
          path: "/identity/verify",
          description: "Initiate citizen identity verification via Nafath",
        },
        {
          method: "GET",
          path: "/identity/verify/{sessionId}",
          description: "Poll verification status",
        },
        {
          method: "DELETE",
          path: "/identity/sessions/{sessionId}",
          description: "Revoke an active verification session",
        },
      ],
    },
    feedback: [],
    version: 1,
  },

  /* ── policy-rules ── */
  {
    id: "da-policy-components",
    storyId: "policy-rules",
    storyTitle: "Permit Policy Rules Engine",
    title: "Component Diagram: Policy Rules Engine",
    type: "component_diagram",
    status: "approved",
    createdBy: "Design Agent",
    reviewedBy: "Omar Rahman",
    impactedLayers: ["Module System", "Process and Governance"],
    impactedServices: ["Policy Engine", "Audit Graph", "Workflow Engine"],
    content: {
      description:
        "Architecture of the reusable policy rules engine with human review gate",
      components: [
        {
          name: "Rule Registry",
          description: "Stores and versions reusable policy rule packages",
          connections: ["Rule Evaluator", "Audit Graph"],
        },
        {
          name: "Rule Evaluator",
          description: "Applies rules against request context and tenant profile",
          connections: ["Review Gate", "Audit Graph"],
        },
        {
          name: "Review Gate",
          description: "Holds automatic enforcement until human review completes",
          connections: ["Workflow Engine"],
        },
        {
          name: "Audit Graph",
          description: "Records every rule evaluation and activation event",
          connections: [],
        },
      ],
    },
    feedback: [],
    version: 1,
  },
  {
    id: "da-policy-api",
    storyId: "policy-rules",
    storyTitle: "Permit Policy Rules Engine",
    title: "API Contract: Policy Management API",
    type: "api_contract",
    status: "in_review",
    createdBy: "Design Agent",
    impactedLayers: ["API and Integration"],
    impactedServices: ["Policy Engine"],
    content: {
      description: "Endpoints for managing policy rule packages and triggering evaluation",
      endpoints: [
        { method: "GET", path: "/policies", description: "List all active policy rule packages" },
        { method: "POST", path: "/policies", description: "Create a new reusable rule package" },
        {
          method: "POST",
          path: "/policies/{id}/evaluate",
          description: "Evaluate a rule package against a given context",
        },
        {
          method: "PATCH",
          path: "/policies/{id}/activate",
          description: "Activate a rule package after human review",
        },
      ],
    },
    feedback: [
      {
        id: "fb2",
        author: "Sara Malik",
        text: "Activation endpoint needs to require reviewer signature in the request body",
        timestamp: "1 hour ago",
        resolved: false,
      },
    ],
    version: 1,
  },
  {
    id: "da-policy-model",
    storyId: "policy-rules",
    storyTitle: "Permit Policy Rules Engine",
    title: "Data Model: Policy Rule Schema",
    type: "data_model",
    status: "approved",
    createdBy: "Design Agent",
    reviewedBy: "Omar Rahman",
    impactedLayers: ["Data and Context"],
    impactedServices: ["Policy Engine"],
    content: {
      description:
        "Schema for a reusable policy rule package stored in the rule registry",
      fields: [
        { name: "ruleId", type: "string", required: true },
        { name: "tenantId", type: "string", required: true },
        { name: "name", type: "string", required: true },
        { name: "category", type: "enum", required: true },
        { name: "conditions", type: "json[]", required: true },
        { name: "actions", type: "json[]", required: true },
        { name: "reviewedBy", type: "string", required: false },
        { name: "activatedAt", type: "datetime", required: false },
      ],
    },
    feedback: [],
    version: 1,
  },

  /* ── regression-suite ── */
  {
    id: "da-regression-flow",
    storyId: "regression-suite",
    storyTitle: "Cross Ministry Regression Suite",
    title: "User Flow: Regression Test Execution",
    type: "user_flow",
    status: "approved",
    createdBy: "Design Agent",
    reviewedBy: "Rayan Fares",
    impactedLayers: ["Intelligence and Orchestration", "Process and Governance"],
    impactedServices: ["Proof Validator", "Test Replay Service"],
    content: {
      description:
        "Automated regression test execution flow with proof validation and evidence assembly",
      steps: [
        {
          id: "s1",
          label: "Select Test Suite",
          description: "QA lead selects the regression suite and target release",
        },
        {
          id: "s2",
          label: "Load Fixtures",
          description: "Replay fixtures and approval snapshots loaded from context store",
        },
        {
          id: "s3",
          label: "Execute Replay",
          description: "Cross service test scenarios executed against the release candidate",
        },
        {
          id: "s4",
          label: "Score Evidence",
          description: "Proof Validator evaluates coverage and completeness",
        },
        {
          id: "s5",
          label: "Generate Report",
          description: "Evidence pack assembled and linked to release record",
        },
      ],
    },
    feedback: [],
    version: 1,
  },
  {
    id: "da-regression-components",
    storyId: "regression-suite",
    storyTitle: "Cross Ministry Regression Suite",
    title: "Component Diagram: Test Infrastructure",
    type: "component_diagram",
    status: "approved",
    createdBy: "Design Agent",
    reviewedBy: "Rayan Fares",
    impactedLayers: ["Intelligence and Orchestration"],
    impactedServices: ["Proof Validator", "Test Replay Service", "Audit Graph"],
    content: {
      description:
        "Infrastructure components supporting the cross ministry regression and proof validation",
      components: [
        {
          name: "Test Replay Service",
          description: "Executes recorded scenarios against live service boundaries",
          connections: ["Proof Validator", "Audit Graph"],
        },
        {
          name: "Proof Validator",
          description: "Scores evidence completeness and release readiness",
          connections: ["Audit Graph"],
        },
        {
          name: "Audit Graph",
          description: "Retains replay results as immutable evidence events",
          connections: [],
        },
      ],
    },
    feedback: [],
    version: 1,
  },
];
