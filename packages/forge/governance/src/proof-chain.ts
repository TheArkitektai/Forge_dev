import { sql } from "@forge/db";
import type { ProofChainEntry } from "@forge/contracts";

export async function createProofChainEntry(
  storyId: string,
  data: string,
  signedBy: string
): Promise<ProofChainEntry> {
  const prevHash = await getLastHash(storyId);
  // Hash input: prevHash + data + signedBy only.
  // Timestamp is NOT included — it is stored for human reference but must not
  // be part of the hash because the DB timestamp (NOW()) is set after the hash
  // is computed, making reproduction impossible.
  const hash = await computeHash(prevHash + data + signedBy);

  const rows = await sql`
    INSERT INTO proof_chain_entries (story_id, previous_hash, data, hash, signed_by)
    VALUES (${storyId}, ${prevHash}, ${data}, ${hash}, ${signedBy})
    RETURNING id, story_id, previous_hash, data, hash, timestamp, signed_by
  `;

  return rows[0] as ProofChainEntry;
}

export async function validateChain(storyId: string): Promise<{ valid: boolean; brokenAt?: string; reason?: string }> {
  const rows = await sql`
    SELECT id, previous_hash, data, hash, signed_by, timestamp
    FROM proof_chain_entries
    WHERE story_id = ${storyId}
    ORDER BY timestamp ASC
  `;

  if (rows.length === 0) return { valid: true };

  let prevHash = "0";
  for (const row of rows) {
    const computedHash = await computeHash(prevHash + row.data + row.signed_by);
    if (computedHash !== row.hash) {
      return {
        valid: false,
        brokenAt: row.id,
        reason: `Hash mismatch at entry ${row.id}: chain may have been tampered with.`,
      };
    }
    prevHash = row.hash;
  }

  return { valid: true };
}

export async function getChain(storyId: string): Promise<ProofChainEntry[]> {
  const rows = await sql`
    SELECT id, story_id, previous_hash, data, hash, timestamp, signed_by
    FROM proof_chain_entries
    WHERE story_id = ${storyId}
    ORDER BY timestamp ASC
  `;
  return rows as unknown as ProofChainEntry[];
}

async function getLastHash(storyId: string): Promise<string> {
  const rows = await sql`
    SELECT hash FROM proof_chain_entries
    WHERE story_id = ${storyId}
    ORDER BY timestamp DESC
    LIMIT 1
  `;
  return rows.length > 0 ? rows[0].hash : "0";
}

export async function computeHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
