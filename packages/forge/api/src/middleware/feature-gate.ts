import { createMiddleware } from "hono/factory";
import type { Variables } from "./auth.js";
import { sql } from "@forge/db";

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

const TIER_FEATURES: Record<string, FeatureKey[]> = {
  forge_team: ["context_hub"],
  forge_enterprise: ["workflow_custom", "governance_advanced", "governance_giskard", "sandbox_execution", "context_hub", "connector_framework", "data_catalog", "compliance"],
  forge_partner: ["workflow_custom", "governance_advanced", "governance_giskard", "sandbox_execution", "context_hub", "connector_framework", "data_catalog", "compliance", "white_label"],
  forge_sovereign: ["workflow_custom", "governance_advanced", "governance_giskard", "sandbox_execution", "context_hub", "connector_framework", "module_registry", "data_catalog", "compliance", "white_label", "tier_3_isolation"],
};

export async function getTierFeatures(orgId: string): Promise<FeatureKey[]> {
  const rows = await sql`
    SELECT t.slug
    FROM subscriptions s
    JOIN subscription_tiers t ON s.tier_id = t.id
    WHERE s.organization_id = ${orgId}
    ORDER BY s.created_at DESC
    LIMIT 1
  `;
  if (rows.length === 0) return [];
  return TIER_FEATURES[rows[0].slug] || [];
}

export function requireFeature(...features: FeatureKey[]) {
  return createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const user = c.get("user");
    const enabled = await getTierFeatures(user.org);
    const missing = features.filter((f) => !enabled.includes(f));
    if (missing.length > 0) {
      return c.json({
        code: "FEATURE_NOT_AVAILABLE",
        message: `Feature(s) not available on current tier: ${missing.join(", ")}`,
        details: { available: enabled, required: features },
      }, 403);
    }
    return await next();
  });
}
