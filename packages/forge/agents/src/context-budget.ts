import type { TokenBudget } from "@forge/contracts";

export function allocateBudget(totalTokens: number): TokenBudget {
  return {
    total: totalTokens,
    used: 0,
    ceiling: totalTokens,
    breakdown: {
      designArtifact: { allocated: Math.floor(totalTokens * 0.40), used: 0 },
      codebaseUnderstanding: { allocated: Math.floor(totalTokens * 0.25), used: 0 },
      relatedPatterns: { allocated: Math.floor(totalTokens * 0.20), used: 0 },
      governanceRules: { allocated: Math.floor(totalTokens * 0.15), used: 0 },
    },
  };
}

export function spendBudget(budget: TokenBudget, category: keyof TokenBudget["breakdown"], tokens: number): TokenBudget {
  const updated = { ...budget };
  updated.used += tokens;
  updated.breakdown = { ...budget.breakdown };
  updated.breakdown[category] = {
    allocated: budget.breakdown[category].allocated,
    used: budget.breakdown[category].used + tokens,
  };
  return updated;
}

export function isOverBudget(budget: TokenBudget): boolean {
  return budget.used > budget.ceiling;
}
