import type { MeteringCheckResult, TokenUsageEvent, UUID } from "@forge/contracts";

export interface MeteringConfig {
  providerCostPerMillion: number;
  customerOverageRatePerMillion: number;
  hardCapMultiplier: number;
}

export const DEFAULT_METERING_CONFIG: MeteringConfig = {
  providerCostPerMillion: 8.0,
  customerOverageRatePerMillion: 10.0,
  hardCapMultiplier: 3.0,
};

export function calculateCost(tokens: number, ratePerMillion: number): number {
  return (tokens / 1_000_000) * ratePerMillion;
}

export function createPreFlightCheck(
  organizationId: UUID,
  currentUsage: number,
  monthlyLimit: number,
  model?: string,
  estimatedTokens?: number
): MeteringCheckResult {
  const remaining = Math.max(0, monthlyLimit - currentUsage);
  const usagePercent = monthlyLimit > 0 ? (currentUsage / monthlyLimit) * 100 : 0;
  const estimatedCost = estimatedTokens ? calculateCost(estimatedTokens, DEFAULT_METERING_CONFIG.providerCostPerMillion) : undefined;

  const allowed = currentUsage < monthlyLimit;
  const warningThreshold = monthlyLimit * 0.9;
  const hardCapThreshold = monthlyLimit;

  return {
    allowed,
    organizationId,
    currentUsage,
    monthlyLimit,
    remaining,
    usagePercent: Math.round(usagePercent * 100) / 100,
    warningThreshold: usagePercent >= 80 ? warningThreshold : undefined,
    hardCapThreshold: usagePercent >= 100 ? hardCapThreshold : undefined,
    model,
    estimatedCost,
  };
}

export function createTokenUsageEvent(params: {
  organizationId: UUID;
  projectId?: UUID;
  storyId?: UUID;
  agentExecutionId?: UUID;
  modelProvider: string;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  providerRatePerMillion: number;
  customerRatePerMillion: number;
}): Omit<TokenUsageEvent, "id" | "createdAt"> {
  const costAtProviderRate = calculateCost(params.inputTokens + params.outputTokens, params.providerRatePerMillion);
  const costAtCustomerRate = calculateCost(params.inputTokens + params.outputTokens, params.customerRatePerMillion);

  return {
    organizationId: params.organizationId,
    projectId: params.projectId,
    storyId: params.storyId,
    agentExecutionId: params.agentExecutionId,
    modelProvider: params.modelProvider,
    modelName: params.modelName,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    costAtProviderRate,
    costAtCustomerRate,
  };
}

export function aggregateDailyUsage(events: TokenUsageEvent[]): {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostProvider: number;
  totalCostCustomer: number;
  storyCount: number;
  executionCount: number;
} {
  const uniqueStories = new Set<string>();
  const uniqueExecutions = new Set<string>();

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCostProvider = 0;
  let totalCostCustomer = 0;

  for (const event of events) {
    totalInputTokens += event.inputTokens;
    totalOutputTokens += event.outputTokens;
    totalCostProvider += Number(event.costAtProviderRate);
    totalCostCustomer += Number(event.costAtCustomerRate);
    if (event.storyId) uniqueStories.add(event.storyId);
    if (event.agentExecutionId) uniqueExecutions.add(event.agentExecutionId);
  }

  return {
    totalInputTokens,
    totalOutputTokens,
    totalCostProvider: Math.round(totalCostProvider * 100) / 100,
    totalCostCustomer: Math.round(totalCostCustomer * 100) / 100,
    storyCount: uniqueStories.size,
    executionCount: uniqueExecutions.size,
  };
}
