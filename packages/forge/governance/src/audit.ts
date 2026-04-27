import { sql } from "@forge/db";
import type { AuditEvent } from "@forge/contracts";

export async function logAuditEvent(event: Omit<AuditEvent, "id">): Promise<AuditEvent> {
  const rows = await sql`
    INSERT INTO audit_events (organization_id, project_id, story_id, type, title, detail, actor_id, actor_role, proof_hash)
    VALUES (
      ${event.organizationId},
      ${event.projectId ?? null},
      ${event.storyId ?? null},
      ${event.type},
      ${event.title},
      ${event.detail},
      ${event.actorId},
      ${event.actorRole},
      ${event.proofHash}
    )
    RETURNING id, organization_id, project_id, story_id, type, title, detail, actor_id, actor_role, timestamp, proof_hash
  `;
  return rows[0] as AuditEvent;
}

export async function getAuditEvents(organizationId: string, options: { storyId?: string; type?: string; limit?: number; offset?: number } = {}): Promise<AuditEvent[]> {
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;
  
  let query;
  if (options.storyId) {
    query = sql`
      SELECT id, organization_id, project_id, story_id, type, title, detail, actor_id, actor_role, timestamp, proof_hash
      FROM audit_events
      WHERE organization_id = ${organizationId} AND story_id = ${options.storyId}
      ORDER BY timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else if (options.type) {
    query = sql`
      SELECT id, organization_id, project_id, story_id, type, title, detail, actor_id, actor_role, timestamp, proof_hash
      FROM audit_events
      WHERE organization_id = ${organizationId} AND type = ${options.type}
      ORDER BY timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  } else {
    query = sql`
      SELECT id, organization_id, project_id, story_id, type, title, detail, actor_id, actor_role, timestamp, proof_hash
      FROM audit_events
      WHERE organization_id = ${organizationId}
      ORDER BY timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }
  
  const rows = await query;
  return rows as unknown as AuditEvent[];
}
