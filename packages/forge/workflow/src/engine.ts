import { sql } from "@forge/db";
import type { StateTransition } from "@forge/contracts";
import { validateTransition } from "./transitions.js";
import { getState, getPhaseOfState } from "./states.js";
import { executeGate } from "./gate-executor.js";
import type { Gate } from "@forge/contracts";
import { transitionQueue } from "./queue.js";

export interface TransitionRequest {
  storyId: string;
  fromState: string;
  toState: string;
  triggeredBy: string;
  reason?: string;
}

export interface TransitionResult {
  success: boolean;
  transition?: StateTransition;
  gateResults?: Awaited<ReturnType<typeof executeGate>>[];
  error?: string;
}

export async function transitionStory(req: TransitionRequest): Promise<TransitionResult> {
  const { storyId, fromState, toState, triggeredBy } = req;
  
  // 1. Validate transition
  const validation = validateTransition(fromState, toState);
  if (!validation.valid) {
    return { success: false, error: validation.reason };
  }
  
  const targetState = getState(toState);
  if (!targetState) {
    return { success: false, error: `Unknown target state: ${toState}` };
  }
  
  // 2. Run gates if target state requires approval
  const gateResults = [];
  if (validation.rule?.requiresApproval) {
    const gates = await sql`
      SELECT id, name, type, check_fn, required_approvers, allowed_roles
      FROM gates
      WHERE type = blocking
      ORDER BY name
    `;
    for (const gate of gates as unknown as Gate[]) {
      const result = await executeGate(gate, storyId, triggeredBy);
      gateResults.push(result);
      if (!result.passed) {
        return { success: false, error: `Gate "${gate.name}" failed: ${result.details}`, gateResults };
      }
    }
  }
  
  // 3. Compute proof hash
  const prevHash = await getLastProofHash(storyId);
  const data = JSON.stringify({ storyId, fromState, toState, triggeredBy, timestamp: new Date().toISOString() });
  const proofHash = await computeHash(prevHash + data);
  
  // 4. Record transition
  const transRows = await sql`
    INSERT INTO state_transitions (story_id, from_phase, to_phase, from_state, to_state, triggered_by, proof_hash)
    VALUES (
      ${storyId},
      ${getPhaseOfState(fromState) || "Unknown"},
      ${targetState.phase},
      ${fromState},
      ${toState},
      ${triggeredBy},
      ${proofHash}
    )
    RETURNING id, story_id, from_phase, to_phase, from_state, to_state, triggered_by, approved_by, timestamp, proof_hash
  `;
  
  // 5. Update story state
  await sql`
    UPDATE stories
    SET phase = ${targetState.phase}, updated_at = NOW()
    WHERE id = ${storyId}
  `;
  
  // 6. Queue async follow-up if agent-driven
  if (targetState.isAgentDriven) {
    await transitionQueue.add("auto-transition", {
      storyId,
      fromState: toState,
      toState: getNextState(toState),
      triggeredBy,
      proofHash,
    }, { delay: 1000 });
  }
  
  return { success: true, transition: transRows[0] as StateTransition, gateResults };
}

async function getLastProofHash(storyId: string): Promise<string> {
  const rows = await sql`
    SELECT proof_hash FROM state_transitions
    WHERE story_id = ${storyId}
    ORDER BY timestamp DESC
    LIMIT 1
  `;
  return rows.length > 0 ? rows[0].proof_hash : "0";
}

async function computeHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getNextState(currentStateId: string): string {
  const current = getState(currentStateId);
  if (!current) return currentStateId;
  const samePhase = current.phase;
  // Find next state in same phase
  const { STATES } = require("./states.js");
  const states = STATES.filter((s: { phase: string }) => s.phase === samePhase).sort((a: { order: number }, b: { order: number }) => a.order - b.order);
  const idx = states.findIndex((s: { id: string }) => s.id === currentStateId);
  if (idx >= 0 && idx < states.length - 1) {
    return states[idx + 1].id;
  }
  return currentStateId;
}
