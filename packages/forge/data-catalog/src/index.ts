import { sql } from "@forge/db";

export interface DataAsset {
  id: string;
  name: string;
  type: "table" | "view" | "stream" | "file";
  source: string;
  schema?: Record<string, unknown>;
  lineage?: string[];
  classification?: "public" | "internal" | "confidential" | "restricted";
  owner: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export async function registerAsset(asset: Omit<DataAsset, "id" | "createdAt" | "updatedAt">): Promise<DataAsset> {
  const rows = await sql`
    INSERT INTO data_catalog_assets (name, type, source, schema, lineage, classification, owner, organization_id, created_at, updated_at)
    VALUES (${asset.name}, ${asset.type}, ${asset.source}, ${asset.schema ? JSON.stringify(asset.schema) : null}, ${asset.lineage ?? null}, ${asset.classification ?? "internal"}, ${asset.owner}, ${asset.organizationId}, NOW(), NOW())
    RETURNING id, name, type, source, schema, lineage, classification, owner, organization_id, created_at, updated_at
  `;
  return rows[0] as unknown as DataAsset;
}

export async function getAssets(organizationId: string): Promise<DataAsset[]> {
  const rows = await sql`
    SELECT id, name, type, source, schema, lineage, classification, owner, organization_id, created_at, updated_at
    FROM data_catalog_assets
    WHERE organization_id = ${organizationId}
    ORDER BY created_at DESC
  `;
  return rows as unknown as DataAsset[];
}

export async function getAssetLineage(assetId: string): Promise<{ upstream: string[]; downstream: string[] }> {
  const rows = await sql`
    SELECT lineage FROM data_catalog_assets WHERE id = ${assetId}
  `;
  if (rows.length === 0) return { upstream: [], downstream: [] };
  const lineage = rows[0].lineage || [];
  return { upstream: lineage, downstream: [] };
}
