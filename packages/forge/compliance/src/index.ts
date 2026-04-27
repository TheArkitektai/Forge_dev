import { sql } from "@forge/db";
import { getAuditEvents } from "@forge/governance";
import type { EvidencePack } from "@forge/contracts";

export type ComplianceFramework = "PDPL" | "NCA_ECC" | "SOC2" | "ISO_27001" | "NDMO";

export interface ComplianceReport {
  id: string;
  organizationId: string;
  framework: ComplianceFramework;
  periodStart: string;
  periodEnd: string;
  evidenceCount: number;
  findings: ComplianceFinding[];
  generatedAt: string;
  downloadUrl?: string;
}

export interface ComplianceFinding {
  id: string;
  control: string;
  status: "pass" | "fail" | "partial";
  evidence: string[];
  remediation?: string;
}

const FRAMEWORK_CONTROLS: Record<ComplianceFramework, string[]> = {
  PDPL: ["data_classification", "consent_management", "data_retention", "breach_notification", "cross_border_transfer"],
  NCA_ECC: ["access_control", "encryption", "audit_logging", "incident_response", "vendor_management"],
  SOC2: ["security", "availability", "processing_integrity", "confidentiality", "privacy"],
  ISO_27001: ["risk_assessment", "asset_management", "access_control", "cryptography", "operations_security"],
  NDMO: ["data_governance", "metadata_management", "quality_assurance", "stewardship", "lineage"],
};

export async function generateReport(
  organizationId: string,
  framework: ComplianceFramework,
  periodStart: string,
  periodEnd: string
): Promise<ComplianceReport> {
  const controls = FRAMEWORK_CONTROLS[framework];
  const auditEvents = await getAuditEvents(organizationId, { limit: 1000 });
  
  const findings: ComplianceFinding[] = controls.map((control) => {
    const relevantEvents = auditEvents.filter((e) => 
      e.detail.toLowerCase().includes(control.toLowerCase()) ||
      e.title.toLowerCase().includes(control.toLowerCase())
    );
    const status = relevantEvents.length > 0 ? "pass" : "partial";
    return {
      id: `${framework}_${control}`,
      control,
      status,
      evidence: relevantEvents.map((e) => e.id),
    };
  });
  
  const report: ComplianceReport = {
    id: crypto.randomUUID(),
    organizationId,
    framework,
    periodStart,
    periodEnd,
    evidenceCount: auditEvents.length,
    findings,
    generatedAt: new Date().toISOString(),
  };
  
  // Store report
  await sql`
    INSERT INTO compliance_reports (id, organization_id, framework, period_start, period_end, evidence_count, findings, generated_at)
    VALUES (${report.id}, ${organizationId}, ${framework}, ${periodStart}, ${periodEnd}, ${report.evidenceCount}, ${JSON.stringify(findings)}, NOW())
  `;
  
  return report;
}

export async function exportEvidencePack(
  organizationId: string,
  scope: "story" | "project" | "organization",
  scopeId: string,
  format: "PDF" | "JSON" | "CSV"
): Promise<EvidencePack> {
  const pack: EvidencePack = {
    id: crypto.randomUUID(),
    storyId: scope === "story" ? scopeId : "",
    format,
    scope,
    generatedAt: new Date().toISOString(),
    downloadUrl: `/api/v1/compliance/evidence/${crypto.randomUUID()}`,
  };
  return pack;
}
