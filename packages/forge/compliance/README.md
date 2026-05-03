# @forge/compliance

Regulatory compliance reports and evidence packs for five frameworks.

**Session 14 — Build | Tier: Enterprise+**

## Supported Frameworks

| Framework | Full Name | Region |
|-----------|-----------|--------|
| `PDPL` | Personal Data Protection Law | Saudi Arabia |
| `NCA_ECC` | National Cybersecurity Authority Essential Cybersecurity Controls | Saudi Arabia |
| `SOC2` | Service Organization Control 2 | USA / International |
| `ISO_27001` | Information Security Management | International |
| `NDMO` | National Data Management Office | Saudi Arabia |

## Generating a Report

```typescript
import { generateReport } from '@forge/compliance';

const report = await generateReport(
  organizationId,
  'PDPL',
  '2026-01-01',
  '2026-03-31'
);

// report.findings — array of controls with pass/partial/fail status
// report.evidenceCount — number of audit events used as evidence
```

## How It Works

1. Pulls audit events from `@forge/governance` for the specified period
2. Maps events to framework controls using the control taxonomy
3. Marks controls as `pass` (events found), `partial` (some evidence), or `fail` (no evidence)
4. Returns a structured report with evidence references for each finding

## Evidence Packs

Evidence packs bundle report findings with referenced audit event IDs for submission to regulators or auditors. Exportable as PDF, JSON, or CSV (Session 41).

## NEOM Coverage

NEOM Gap G10 — NDMO / NCA compliance.
Config session: Session 15.
