export type FeatureKey =
  | "workflow_custom"
  | "governance_advanced"
  | "governance_giskard"
  | "sandbox_execution"
  | "context_hub"
  | "connector_framework"
  | "module_registry"
  | "data_catalog"
  | "compliance"
  | "white_label"
  | "tier_3_isolation";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  phaseCount: number;
  stateCount: number;
  gateType: "single" | "dual" | "triple";
  features: FeatureKey[];
  minTier: string;
  states: string[];
}

export const STANDARD_SDLC_TEMPLATE: WorkflowTemplate = {
  id: "standard_sdlc",
  name: "Standard SDLC",
  description: "6 phases, 22 states, full governance gates at every transition",
  phaseCount: 6,
  stateCount: 22,
  gateType: "single",
  features: ["workflow_custom"],
  minTier: "forge_team",
  states: [
    "pending", "brief", "ready_design",
    "designing", "design_review", "ready_dev",
    "coding", "testing", "code_review", "revisions", "ready_ci",
    "ci_running", "ci_pass", "ci_fail",
    "shipped", "released", "done",
    "monitoring", "incident_detected", "investigating", "remediating", "resolved",
  ],
};

export const LIGHTWEIGHT_AGILE_TEMPLATE: WorkflowTemplate = {
  id: "lightweight_agile",
  name: "Lightweight Agile",
  description: "3 phases, 9 states, essential governance only",
  phaseCount: 3,
  stateCount: 9,
  gateType: "single",
  features: [],
  minTier: "forge_team",
  states: [
    "pending", "brief", "ready_design",
    "coding", "testing", "ready_ci",
    "ci_pass", "shipped", "done",
  ],
};

export const ENTERPRISE_GOVERNED_TEMPLATE: WorkflowTemplate = {
  id: "enterprise_governed",
  name: "Enterprise Governed",
  description: "7 phases, 24 states, dual approval gates",
  phaseCount: 7,
  stateCount: 24,
  gateType: "dual",
  features: ["workflow_custom", "governance_advanced"],
  minTier: "forge_enterprise",
  states: STANDARD_SDLC_TEMPLATE.states,
};

export const COMPLIANCE_HEAVY_TEMPLATE: WorkflowTemplate = {
  id: "compliance_heavy",
  name: "Compliance Heavy",
  description: "8 phases, 30 states, triple approval, maximum governance",
  phaseCount: 8,
  stateCount: 30,
  gateType: "triple",
  features: ["workflow_custom", "governance_advanced", "governance_giskard"],
  minTier: "forge_enterprise",
  states: STANDARD_SDLC_TEMPLATE.states,
};

export const TEMPLATES: WorkflowTemplate[] = [
  STANDARD_SDLC_TEMPLATE,
  LIGHTWEIGHT_AGILE_TEMPLATE,
  ENTERPRISE_GOVERNED_TEMPLATE,
  COMPLIANCE_HEAVY_TEMPLATE,
];

export function getTemplate(id: string): WorkflowTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesForTier(tierSlug: string): WorkflowTemplate[] {
  const tierOrder: Record<string, number> = {
    forge_team: 1,
    forge_enterprise: 2,
    forge_partner: 2,
    forge_sovereign: 3,
  };
  const tierLevel = tierOrder[tierSlug] || 0;
  return TEMPLATES.filter((t) => {
    const minLevel = tierOrder[t.minTier] || 0;
    return tierLevel >= minLevel;
  });
}
