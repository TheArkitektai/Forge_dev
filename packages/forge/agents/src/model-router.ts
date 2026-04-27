export type ModelTier = "haiku" | "sonnet" | "opus";

export interface ModelConfig {
  tier: ModelTier;
  provider: string;
  modelId: string;
  costPer1kInput: number;
  costPer1kOutput: number;
  maxTokens: number;
  qualityScore: number; // 0-100
}

export const MODELS: Record<ModelTier, ModelConfig> = {
  haiku: {
    tier: "haiku",
    provider: "anthropic",
    modelId: "claude-3-5-haiku-latest",
    costPer1kInput: 0.25,
    costPer1kOutput: 1.25,
    maxTokens: 8192,
    qualityScore: 60,
  },
  sonnet: {
    tier: "sonnet",
    provider: "anthropic",
    modelId: "claude-3-7-sonnet-latest",
    costPer1kInput: 3.0,
    costPer1kOutput: 15.0,
    maxTokens: 8192,
    qualityScore: 85,
  },
  opus: {
    tier: "opus",
    provider: "anthropic",
    modelId: "claude-3-opus-latest",
    costPer1kInput: 15.0,
    costPer1kOutput: 75.0,
    maxTokens: 4096,
    qualityScore: 95,
  },
};

export type TaskType = "classify" | "reason" | "architect" | "code" | "test" | "review";

const TASK_MODEL_MAP: Record<TaskType, ModelTier> = {
  classify: "haiku",
  reason: "sonnet",
  architect: "opus",
  code: "sonnet",
  test: "sonnet",
  review: "haiku",
};

export function selectModel(taskType: TaskType, qualityThreshold?: number): ModelConfig {
  const tier = TASK_MODEL_MAP[taskType] || "sonnet";
  const model = MODELS[tier];
  
  // Upgrade if quality threshold not met
  if (qualityThreshold && model.qualityScore < qualityThreshold) {
    if (MODELS.opus.qualityScore >= qualityThreshold) return MODELS.opus;
    if (MODELS.sonnet.qualityScore >= qualityThreshold) return MODELS.sonnet;
  }
  
  return model;
}

export function estimateCost(model: ModelConfig, inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1000) * model.costPer1kInput + (outputTokens / 1000) * model.costPer1kOutput;
}
