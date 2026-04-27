import { sql } from "@forge/db";
import { getActiveExecutions } from "./execution-service.js";

export async function checkConcurrencyLimit(organizationId: string): Promise<{ allowed: boolean; current: number; max: number }> {
  const tierRows = await sql`
    SELECT t.max_concurrent_agents
    FROM subscriptions s
    JOIN subscription_tiers t ON s.tier_id = t.id
    WHERE s.organization_id = ${organizationId}
    ORDER BY s.created_at DESC
    LIMIT 1
  `;
  
  const max = tierRows.length > 0 ? Number(tierRows[0].max_concurrent_agents) : 2;
  const current = await getActiveExecutions(organizationId);
  
  return { allowed: current < max, current, max };
}
