# NEOM Tenant Configuration

Configuration-only directory. Zero application code lives here.

## Principle

> Forge is the product. NEOM is the proof.

All platform capabilities are implemented generically in `packages/forge/`. This directory contains only the configuration values that specialise the platform for NEOM.

## Subscription Assignment

- **Tier**: Forge Sovereign
- **Tokens / Month**: 500,000,000 (custom override — 5× the standard Sovereign allocation)
- **Hard Cap**: 1,000,000,000 tokens / month
- **Max Projects**: 50
- **Max Users**: 500
- **Max Concurrent Agents**: 50
- **Billing Cycle**: Annual
- **Grace Period**: 60 days
- **Data Retention**: 2,555 days (7 years — regulatory requirement)

## Enabled Connectors

| Connector | System | Purpose | NEOM Gap |
|-----------|--------|---------|----------|
| `tos` | Transport Operations System | Port logistics data | G11 |
| `fasah` | FASAH / ZATCA | Customs & trade compliance | G04 |
| `github` | GitHub | Code version control | — |

## Governance Posture

- **Mode**: Maximum
- **Required Gates**: pii_scan, code_quality, test_coverage, security_scan, hallucination_check
- **Compliance Frameworks**: PDPL, NCA_ECC, NDMO
- **Default Workflow**: Compliance Heavy template

## NEOM Gap Closure Map

| Gap | Need | Forge Module | Build Session | Config Session | Priority |
|-----|------|-------------|---------------|----------------|----------|
| G04 | FASAH / ZATCA | `@forge/connector-framework` | 10 | 12 | P0 |
| G01 | Power BI | `@forge/bi-connector` | 23 | 26 | P1 |
| G02 | Port master data | `@forge/master-data` | 22 | 26 | P1 |
| G03 | 8 data products | `@forge/data-product-framework` | 21 | 26 | P1 |
| G05 | EDI / EDIFACT | `@forge/protocol-adapter` | 24 | 26 | P1 |
| G06 | Managed File Transfer | `@forge/mft` | 24 | 26 | P1 |
| G07 | Durable events | `@forge/events` (Kafka) | 31 | 32 | P2 |
| G08 | Canonical model | `@forge/data-catalog` | 13 | 15 | P1 |
| G09 | OLAP cubes | `@forge/analytics-transform` | 25 | 26 | P2 |
| G10 | NDMO / NCA compliance | `@forge/compliance` | 14 | 15 | P1 |
| G11 | OT connectors | `@forge/connector-framework` | 10 | 12, 26 | P1 |

## Validation

```bash
# Run NEOM Phase 1 validation
npx tsx tenants/neom/validate.ts
```

Checks: tier template availability, gate availability, connector registration, gap closure status.

## Rules

- No TypeScript source files in this directory (except `validate.ts`)
- No hardcoded secrets — all sensitive values via environment variables or Vault
- Configuration changes are reviewed and approved before applying to production
