/* 22 Kanban States across 6 Phases — Architecture v12 */

export type Phase = "Plan" | "Design" | "Develop" | "Test" | "Ship" | "Operate";

export interface StateDef {
  id: string;
  name: string;
  phase: Phase;
  order: number;
  isTerminal: boolean;
  isAgentDriven: boolean;
  isHumanGate: boolean;
}

export const STATES: StateDef[] = [
  // Phase 1: Plan
  { id: "pending", name: "Pending", phase: "Plan", order: 1, isTerminal: false, isAgentDriven: false, isHumanGate: false },
  { id: "brief", name: "Brief", phase: "Plan", order: 2, isTerminal: false, isAgentDriven: true, isHumanGate: false },
  { id: "ready_design", name: "Ready Design", phase: "Plan", order: 3, isTerminal: false, isAgentDriven: false, isHumanGate: true },
  // Phase 2: Design
  { id: "designing", name: "Designing", phase: "Design", order: 4, isTerminal: false, isAgentDriven: true, isHumanGate: false },
  { id: "design_review", name: "Design Review", phase: "Design", order: 5, isTerminal: false, isAgentDriven: false, isHumanGate: true },
  { id: "ready_dev", name: "Ready Dev", phase: "Design", order: 6, isTerminal: false, isAgentDriven: false, isHumanGate: true },
  // Phase 3: Develop
  { id: "coding", name: "Coding", phase: "Develop", order: 7, isTerminal: false, isAgentDriven: true, isHumanGate: false },
  { id: "testing", name: "Testing", phase: "Develop", order: 8, isTerminal: false, isAgentDriven: true, isHumanGate: false },
  { id: "code_review", name: "Code Review", phase: "Develop", order: 9, isTerminal: false, isAgentDriven: false, isHumanGate: true },
  { id: "revisions", name: "Revisions", phase: "Develop", order: 10, isTerminal: false, isAgentDriven: true, isHumanGate: false },
  { id: "ready_ci", name: "Ready CI", phase: "Develop", order: 11, isTerminal: false, isAgentDriven: false, isHumanGate: false },
  // Phase 4: Test & Build
  { id: "ci_running", name: "CI Running", phase: "Test", order: 12, isTerminal: false, isAgentDriven: true, isHumanGate: false },
  { id: "ci_pass", name: "CI Pass", phase: "Test", order: 13, isTerminal: false, isAgentDriven: false, isHumanGate: true },
  { id: "ci_fail", name: "CI Fail", phase: "Test", order: 14, isTerminal: false, isAgentDriven: true, isHumanGate: false },
  // Phase 5: Ship
  { id: "shipped", name: "Shipped", phase: "Ship", order: 15, isTerminal: false, isAgentDriven: false, isHumanGate: false },
  { id: "released", name: "Released", phase: "Ship", order: 16, isTerminal: false, isAgentDriven: false, isHumanGate: true },
  { id: "done", name: "Done", phase: "Ship", order: 17, isTerminal: true, isAgentDriven: false, isHumanGate: false },
  // Phase 6: Operate
  { id: "monitoring", name: "Monitoring", phase: "Operate", order: 18, isTerminal: false, isAgentDriven: false, isHumanGate: false },
  { id: "incident_detected", name: "Incident Detected", phase: "Operate", order: 19, isTerminal: false, isAgentDriven: false, isHumanGate: false },
  { id: "investigating", name: "Investigating", phase: "Operate", order: 20, isTerminal: false, isAgentDriven: true, isHumanGate: false },
  { id: "remediating", name: "Remediating", phase: "Operate", order: 21, isTerminal: false, isAgentDriven: true, isHumanGate: true },
  { id: "resolved", name: "Resolved", phase: "Operate", order: 22, isTerminal: true, isAgentDriven: false, isHumanGate: false },
];

export const STATE_MAP = new Map(STATES.map((s) => [s.id, s]));

export function getState(id: string): StateDef | undefined {
  return STATE_MAP.get(id);
}

export function getStatesByPhase(phase: Phase): StateDef[] {
  return STATES.filter((s) => s.phase === phase);
}

export function getPhaseOfState(stateId: string): Phase | undefined {
  return STATE_MAP.get(stateId)?.phase;
}
