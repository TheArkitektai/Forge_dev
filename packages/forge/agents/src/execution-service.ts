import { sql } from "@forge/db";
import type { AgentExecution, MeteringCheckResult } from "@forge/contracts";
import { selectModel, estimateCost, type TaskType } from "./model-router.js";

export interface ExecutionRequest {
  storyId: string;
  organizationId: string;
  taskType: TaskType;
  prompt: string;
  contextBudget?: number;
  qualityThreshold?: number;
}

export interface ExecutionResult {
  execution: AgentExecution;
  output: string;
  costUsd: number;
}

export async function preFlightCheck(organizationId: string, estimatedTokens: number): Promise<MeteringCheckResult> {
  // Get subscription info
  const subRows = await sql`
    SELECT t.included_tokens_monthly, t.hard_cap_tokens_monthly
    FROM subscriptions s
    JOIN subscription_tiers t ON s.tier_id = t.id
    WHERE s.organization_id = ${organizationId}
    ORDER BY s.created_at DESC
    LIMIT 1
  `;
  
  if (subRows.length === 0) {
    return { allowed: false, organizationId, currentUsage: 0, monthlyLimit: 0, remaining: 0, usagePercent: 0, warningThreshold: 0, hardCapThreshold: 0 };
  }
  
  const included = Number(subRows[0].included_tokens_monthly);
  const hardCap = Number(subRows[0].hard_cap_tokens_monthly);
  
  // Get current usage
  const usageRows = await sql`
    SELECT COALESCE(SUM(input_tokens + output_tokens), 0) as total
    FROM token_usage_events
    WHERE organization_id = ${organizationId}
      AND created_at >= DATE_TRUNC("month", NOW())
  `;
  
  const currentUsage = Number(usageRows[0].total);
  const projectedUsage = currentUsage + estimatedTokens;
  const usagePercent = included > 0 ? Math.round((currentUsage / included) * 100) : 0;
  
  // Check limits
  if (projectedUsage > hardCap) {
    return {
      allowed: false,
      organizationId,
      currentUsage,
      monthlyLimit: hardCap,
      remaining: Math.max(0, hardCap - currentUsage),
      usagePercent,
      warningThreshold: 80,
      hardCapThreshold: 100,
      estimatedCost: undefined,
    };
  }
  
  return {
    allowed: true,
    organizationId,
    currentUsage,
    monthlyLimit: included,
    remaining: Math.max(0, included - currentUsage),
    usagePercent,
    warningThreshold: usagePercent >= 80 ? usagePercent : undefined,
    hardCapThreshold: usagePercent >= 100 ? 100 : undefined,
    estimatedCost: undefined,
  };
}

export async function executeAgent(req: ExecutionRequest): Promise<ExecutionResult> {
  const { storyId, organizationId, taskType, prompt, qualityThreshold } = req;
  
  // 1. Pre-flight check
  const estimatedInputTokens = Math.ceil(prompt.length / 4); // rough estimate
  const check = await preFlightCheck(organizationId, estimatedInputTokens + 2000);
  if (!check.allowed) {
    throw new Error(`Execution blocked: ${check.usagePercent}% of token budget used`);
  }
  
  // 2. Select model
  const model = selectModel(taskType, qualityThreshold);
  
  // 3. Record execution start
  const execRows = await sql`
    INSERT INTO agent_executions (story_id, organization_id, status, model_used, input_tokens, output_tokens, cost_usd, started_at)
    VALUES (${storyId}, ${organizationId}, "executing", ${model.modelId}, ${estimatedInputTokens}, 0, 0, NOW())
    RETURNING id, story_id, organization_id, status, model_used, input_tokens, output_tokens, cost_usd, started_at
  `;
  const execution = execRows[0] as AgentExecution;
  
  // 4. Execute (placeholder — actual LLM call would go here)
  const output = `[Agent output placeholder for task: ${taskType}]`;
  const outputTokens = Math.ceil(output.length / 4);
  const costUsd = estimateCost(model, estimatedInputTokens, outputTokens);
  
  // 5. Record completion
  await sql`
    UPDATE agent_executions
    SET status = "completed",
        output_tokens = ${outputTokens},
        cost_usd = ${costUsd},
        completed_at = NOW()
    WHERE id = ${execution.id}
  `;
  
  // 6. Emit metering event
  await sql`
    INSERT INTO token_usage_events (organization_id, project_id, story_id, agent_execution_id, model_provider, model_name, input_tokens, output_tokens, cost_at_provider_rate, cost_at_customer_rate, created_at)
    VALUES (
      ${organizationId},
      NULL,
      ${storyId},
      ${execution.id},
      ${model.provider},
      ${model.modelId},
      ${estimatedInputTokens},
      ${outputTokens},
      ${costUsd},
      ${costUsd},
      NOW()
    )
  `;
  
  return {
    execution: { ...execution, status: "completed", outputTokens, costUsd } as AgentExecution,
    output,
    costUsd,
  };
}

export async function getActiveExecutions(organizationId: string): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*) as count
    FROM agent_executions
    WHERE organization_id = ${organizationId} AND status IN ("compiling_context", "executing")
  `;
  return Number(rows[0].count);
}
