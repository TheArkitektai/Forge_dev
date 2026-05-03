import { STATES, type Phase } from "./states.js";

export interface TransitionRule {
  from: string;
  to: string;
  allowed: boolean;
  requiresApproval: boolean;
  approverRoles: string[];
  autoTransition: boolean; // agent-driven transitions
}

/* Default transition matrix: sequential within phase, cross-phase at gates */
function buildDefaultRules(): TransitionRule[] {
  const rules: TransitionRule[] = [];
  
  // Within-phase sequential transitions
  const phases: Phase[] = ["Plan", "Design", "Develop", "Test", "Ship", "Operate"];
  for (const phase of phases) {
    const states = STATES.filter((s) => s.phase === phase).sort((a, b) => a.order - b.order);
    for (let i = 0; i < states.length - 1; i++) {
      rules.push({
        from: states[i].id,
        to: states[i + 1].id,
        allowed: true,
        requiresApproval: states[i + 1].isHumanGate,
        approverRoles: states[i + 1].isHumanGate ? ["project_lead", "tenant_admin", "platform_admin"] : [],
        autoTransition: states[i + 1].isAgentDriven,
      });
      // Allow backward to previous state
      rules.push({
        from: states[i + 1].id,
        to: states[i].id,
        allowed: true,
        requiresApproval: false,
        approverRoles: [],
        autoTransition: false,
      });
    }
  }
  
  // Cross-phase transitions (at gate states)
  const phaseBoundaries: [string, string][] = [
    ["ready_design", "designing"],      // Plan -> Design
    ["ready_dev", "coding"],            // Design -> Develop
    ["ready_ci", "ci_running"],         // Develop -> Test
    ["ci_pass", "shipped"],             // Test -> Ship
    ["done", "monitoring"],             // Ship -> Operate
  ];
  for (const [from, to] of phaseBoundaries) {
    rules.push({
      from, to,
      allowed: true,
      requiresApproval: true,
      approverRoles: ["project_lead", "tenant_admin", "platform_admin"],
      autoTransition: false,
    });
  }
  
  // Special: Blocked from any state
  for (const state of STATES) {
    rules.push({
      from: state.id, to: "blocked",
      allowed: true, requiresApproval: false, approverRoles: [], autoTransition: false,
    });
    rules.push({
      from: "blocked", to: state.id,
      allowed: true, requiresApproval: false, approverRoles: [], autoTransition: false,
    });
  }
  
  // Cancelled from any state (terminal)
  for (const state of STATES) {
    rules.push({
      from: state.id, to: "cancelled",
      allowed: true, requiresApproval: true, approverRoles: ["tenant_admin", "platform_admin"], autoTransition: false,
    });
  }
  
  // CI fail -> Revisions (loop back)
  rules.push({
    from: "ci_fail", to: "revisions",
    allowed: true, requiresApproval: false, approverRoles: [], autoTransition: false,
  });
  
  return rules;
}

export const DEFAULT_TRANSITION_RULES = buildDefaultRules();
export const RULE_MAP = new Map(DEFAULT_TRANSITION_RULES.map((r) => [`${r.from}->${r.to}`, r]));

export function canTransition(from: string, to: string): TransitionRule | undefined {
  return RULE_MAP.get(`${from}->${to}`);
}

export function validateTransition(from: string, to: string): { valid: boolean; reason?: string; rule?: TransitionRule } {
  const rule = canTransition(from, to);
  if (!rule) return { valid: false, reason: `Transition from "${from}" to "${to}" is not allowed` };
  if (!rule.allowed) return { valid: false, reason: `Transition from "${from}" to "${to}" is disabled` };
  return { valid: true, rule };
}
