# @forge/governance

Arkitekt Forge Governance Module — Proof chain, blocking gates, audit trail, and tier-based gate availability.

## Components

### Proof Chain
- `createProofChainEntry(storyId, data, signedBy)` — Creates a new SHA-256 hash linked entry
- `validateChain(storyId)` — Validates chain integrity
- `getChain(storyId)` — Retrieves full chain for a story

### Gates (3 MVP + 7 Enterprise)
- **pii_scan** — Detects SSN, email, credit card, phone patterns in artifacts
- **code_quality** — Checks file length, TODOs, test references, console statements
- **test_coverage** — Validates coverage against threshold
- *Enterprise+: security_scan, hallucination_check, license_scan, accessibility_check, performance_budget, dependency_check, api_contract_check*

### Audit
- `logAuditEvent(event)` — Records audit events to audit_events table
- `getAuditEvents(orgId, options)` — Retrieves paginated audit events

### Tier-Based Availability
- Team tier: 3 basic gates
- Enterprise/Partner/Sovereign: all 10 gates
