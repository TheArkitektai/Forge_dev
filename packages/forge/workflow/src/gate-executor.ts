import { sql } from "@forge/db";
import type { Gate, GateResult } from "@forge/contracts";

export type GateCheckFn = (storyId: string, context: Record<string, unknown>) => Promise<{ passed: boolean; score?: number; details: string }>;

export const GATE_REGISTRY = new Map<string, GateCheckFn>();

export function registerGate(name: string, fn: GateCheckFn): void {
  GATE_REGISTRY.set(name, fn);
}

export async function executeGate(gate: Gate, storyId: string, userId: string, context: Record<string, unknown> = {}): Promise<GateResult> {
  const checkFn = GATE_REGISTRY.get(gate.checkFn);
  let passed = false;
  let score: number | undefined;
  let details = "Gate check not implemented";
  
  if (checkFn) {
    const result = await checkFn(storyId, context);
    passed = result.passed;
    score = result.score;
    details = result.details;
  }
  
  const resultRows = await sql`
    INSERT INTO gate_results (gate_id, story_id, passed, score, details, executed_by)
    VALUES (${gate.id}, ${storyId}, ${passed}, ${score ?? null}, ${details}, ${userId})
    RETURNING id, gate_id, story_id, passed, score, details, executed_at, executed_by
  `;
  
  return resultRows[0] as GateResult;
}

// Default gates (Session 08 will add real checks)
registerGate("pii_scan", async () => ({ passed: true, details: "PII scan placeholder" }));
registerGate("code_quality", async () => ({ passed: true, details: "Code quality placeholder" }));
registerGate("test_coverage", async () => ({ passed: true, details: "Test coverage placeholder" }));
registerGate("security_scan", async () => ({ passed: true, details: "Security scan placeholder" }));
registerGate("hallucination_check", async () => ({ passed: true, score: 95, details: "Hallucination check placeholder" }));
