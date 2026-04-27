import type { SubscriptionTier, SubscriptionTierSlug } from "@forge/contracts";

export const DEFAULT_TIERS: Record<SubscriptionTierSlug, Omit<SubscriptionTier, "id" | "createdAt" | "updatedAt">> = {
  forge_team: {
    slug: "forge_team",
    name: "Forge Team",
    annualPriceUsd: 14400,
    monthlyPriceUsd: 1200,
    includedTokensMonthly: 5_000_000,
    overageRatePerMillion: 12.0,
    hardCapTokensMonthly: 10_000_000,
    maxProjects: 3,
    maxUsers: 10,
    maxConcurrentAgents: 2,
    gracePeriodDays: 30,
    dataRetentionDays: 90,
    features: { workflow_templates: true, governance_gates: true },
    isActive: true,
  },
  forge_enterprise: {
    slug: "forge_enterprise",
    name: "Forge Enterprise",
    annualPriceUsd: 120_000,
    monthlyPriceUsd: 10_000,
    includedTokensMonthly: 50_000_000,
    overageRatePerMillion: 10.0,
    hardCapTokensMonthly: 150_000_000,
    maxProjects: 25,
    maxUsers: 100,
    maxConcurrentAgents: 10,
    gracePeriodDays: 30,
    dataRetentionDays: 90,
    features: { workflow_templates: true, governance_gates: true },
    isActive: true,
  },
  forge_partner: {
    slug: "forge_partner",
    name: "Partner Edition",
    annualPriceUsd: 110_000,
    monthlyPriceUsd: 9167,
    includedTokensMonthly: 40_000_000,
    overageRatePerMillion: 10.0,
    hardCapTokensMonthly: 120_000_000,
    maxProjects: 999_999,
    maxUsers: 50,
    maxConcurrentAgents: 8,
    gracePeriodDays: 30,
    dataRetentionDays: 90,
    features: { workflow_templates: true, governance_gates: true },
    isActive: true,
  },
  forge_sovereign: {
    slug: "forge_sovereign",
    name: "Forge Sovereign",
    annualPriceUsd: 250_000,
    monthlyPriceUsd: 20_833,
    includedTokensMonthly: 100_000_000,
    overageRatePerMillion: 9.0,
    hardCapTokensMonthly: 500_000_000,
    maxProjects: 999_999,
    maxUsers: 999_999,
    maxConcurrentAgents: 20,
    gracePeriodDays: 60,
    dataRetentionDays: 365,
    features: { workflow_templates: true, governance_gates: true, visual_builder: true },
    isActive: true,
  },
};

export function getTierFeatures(tierSlug: SubscriptionTierSlug): Record<string, unknown> {
  return DEFAULT_TIERS[tierSlug]?.features ?? {};
}

export function isFeatureEnabled(tierSlug: SubscriptionTierSlug, featureKey: string): boolean {
  const features = getTierFeatures(tierSlug);
  return !!features[featureKey];
}

export function getMaxProjects(tierSlug: SubscriptionTierSlug): number {
  return DEFAULT_TIERS[tierSlug]?.maxProjects ?? 0;
}

export function getMaxUsers(tierSlug: SubscriptionTierSlug): number {
  return DEFAULT_TIERS[tierSlug]?.maxUsers ?? 0;
}

export function getMaxConcurrentAgents(tierSlug: SubscriptionTierSlug): number {
  return DEFAULT_TIERS[tierSlug]?.maxConcurrentAgents ?? 0;
}
