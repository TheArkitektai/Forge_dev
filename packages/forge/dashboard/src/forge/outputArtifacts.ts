import type { OutputArtifact } from "@/forge/types";

export const outputArtifacts: OutputArtifact[] = [
  {
    id: "artifact-live-1",
    storyId: "forge-story-1",
    projectId: "ndpp",
    title: "Citizen Authentication Portal",
    type: "live-preview",
    description: "Live preview of the citizen authentication flow with Nafath SSO integration and PDPL consent",
    previewUrl: "/demo/citizen-auth-preview",
    previewComponent: "citizen_auth",
    githubUrl: "https://github.com/TheArkitektai/arkitekt-forge-demo/tree/main/src/auth",
    timestamp: "2 hours ago",
    generatedBy: "Developer",
    phase: "Develop",
  },
  {
    id: "artifact-code-1",
    storyId: "forge-story-1",
    projectId: "ndpp",
    title: "NafathProvider.ts",
    type: "code",
    description: "Identity verification provider implementing Nafath SSO protocol with PDPL consent management",
    codeSnippet: `import { NafathConfig, VerificationResult } from './types';
import { PDPLConsentManager } from './PDPLConsentFlow';

export class NafathProvider {
  private config: NafathConfig;
  private consentManager: PDPLConsentManager;

  constructor(config: NafathConfig) {
    this.config = config;
    this.consentManager = new PDPLConsentManager(config.pdplPolicy);
  }

  async verifyIdentity(nationalId: string): Promise<VerificationResult> {
    // Step 1: Verify PDPL consent before processing
    const consent = await this.consentManager.checkConsent(nationalId);
    if (!consent.granted) {
      return { verified: false, reason: 'PDPL consent required' };
    }

    // Step 2: Initiate Nafath verification
    const session = await this.initiateSession(nationalId);

    // Step 3: Wait for citizen confirmation via Nafath app
    const result = await this.awaitConfirmation(session.id);

    // Step 4: Record verification in proof chain
    await this.recordProofChainEntry(result);

    return result;
  }

  private async initiateSession(nationalId: string) {
    const response = await fetch(this.config.nafathApiUrl + '/sessions', {
      method: 'POST',
      headers: { 'Authorization': \`Bearer \${this.config.apiKey}\` },
      body: JSON.stringify({ nationalId, scope: 'identity.verify' }),
    });
    return response.json();
  }

  private async awaitConfirmation(sessionId: string, maxWait = 60000) {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWait) {
      await new Promise(r => setTimeout(r, 2000));
      const status = await this.pollSession(sessionId);
      if (status.complete) return status.result;
    }
    throw new Error('Nafath verification timeout');
  }

  private async recordProofChainEntry(result: VerificationResult) {
    await fetch('/api/proof-chain/entries', {
      method: 'POST',
      body: JSON.stringify({ type: 'identity-verification', result, timestamp: new Date().toISOString() }),
    });
  }
}`,
    language: "typescript",
    githubUrl: "https://github.com/TheArkitektai/arkitekt-forge-demo/blob/main/src/auth/NafathProvider.ts",
    timestamp: "2 hours ago",
    generatedBy: "AI Agent",
    phase: "Develop",
  },
  {
    id: "artifact-doc-1",
    storyId: "forge-story-1",
    projectId: "ndpp",
    title: "Architecture Impact Assessment",
    type: "document",
    description: "Auto generated architecture impact analysis for Citizen Authentication Service",
    codeSnippet: `## Architecture Impact Assessment

### Story: Citizen Authentication Service

### Impacted Layers

**Layer 1: Customer Interaction**
New authentication UI components for Nafath flow. WCAG 2.1 AA compliance required.

**Layer 3: Intelligence**
Context compiler patterns updated for identity verification. 7 reusable patterns identified.

**Layer 5: Data and Context**
Session storage schema changes in PostgreSQL. Three new fields added (backwards compatible).

### Risk Assessment
Overall risk: Low. Pattern reused from 4 previous deployments with zero exceptions.

### Service Boundaries
New boundary introduced between Citizen Portal and Nafath Identity Provider.
PDPL requires consent records remain within ministry data boundary.

### Evidence
Proof hash: 7f3a2b1c
Approved by: Sara Malik (Solution Architect)
Date: April 20, 2026`,
    language: "markdown",
    timestamp: "1 day ago",
    generatedBy: "AI Agent",
    phase: "Design",
  },
  {
    id: "artifact-api-1",
    storyId: "forge-story-1",
    projectId: "ndpp",
    title: "Identity Verification API Specification",
    type: "api-spec",
    description: "OpenAPI 3.1 specification for the citizen identity verification endpoints",
    codeSnippet: `openapi: 3.1.0
info:
  title: Citizen Identity Verification API
  version: 1.0.0
  description: Identity verification service using Nafath SSO for Saudi government digital services

paths:
  /api/v1/identity/verify:
    post:
      summary: Initiate identity verification
      operationId: initiateVerification
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [nationalId, consentGranted]
              properties:
                nationalId:
                  type: string
                  pattern: '^[0-9]{10}$'
                  description: Saudi national ID (10 digits)
                consentGranted:
                  type: boolean
                  description: PDPL consent acknowledgement required before processing
      responses:
        '202':
          description: Verification initiated, awaiting Nafath confirmation
          content:
            application/json:
              schema:
                type: object
                properties:
                  sessionId: { type: string }
                  expiresAt: { type: string, format: date-time }
        '400':
          description: Invalid national ID or consent not granted
        '429':
          description: Rate limit exceeded

  /api/v1/identity/verify/{sessionId}:
    get:
      summary: Poll verification status
      parameters:
        - name: sessionId
          in: path
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Verification status
          content:
            application/json:
              schema:
                type: object
                properties:
                  status: { type: string, enum: [pending, verified, failed, expired] }
                  verifiedAt: { type: string, format: date-time }
                  proofHash: { type: string }`,
    language: "yaml",
    githubUrl: "https://github.com/TheArkitektai/arkitekt-forge-demo/blob/main/docs/api-spec.yml",
    timestamp: "1 day ago",
    generatedBy: "AI Agent",
    phase: "Design",
  },
  {
    id: "artifact-test-1",
    storyId: "forge-story-1",
    projectId: "ndpp",
    title: "Test Coverage Report",
    type: "test-report",
    description: "Complete test suite results for the Citizen Authentication Service",
    codeSnippet: `TEST RESULTS: Citizen Authentication Service
Run completed: April 22, 2026 at 09:14 AST

SUMMARY
Total tests: 87
Passed: 85
Failed: 0
Skipped: 2

Coverage: 94.2%

UNIT TESTS (62 tests, 62 passed)
NafathProvider
  verifyIdentity with valid national ID: PASS
  verifyIdentity with invalid national ID: PASS
  verifyIdentity with consent denied: PASS
  session timeout handling: PASS
  retry with exponential backoff: PASS

PDPLConsentFlow
  checkConsent with existing record: PASS
  checkConsent with no record: PASS
  recordConsent stores correct fields: PASS
  consentExpiry validation: PASS

SessionManager
  createSession with 256-bit entropy: PASS
  sessionExpiry notification trigger: PASS
  revokeSession removes all data: PASS

INTEGRATION TESTS (25 tests, 23 passed, 2 skipped)
Nafath API Integration (sandbox)
  Full verification flow: PASS
  Timeout and retry behavior: PASS
  Concurrent sessions: PASS

PDPL Audit Trail Integration
  Consent recorded before processing: PASS
  Audit log contains all required fields: PASS
  Cross-service consent propagation: SKIPPED (requires production Nafath endpoint)
  Citizen notification delivery: SKIPPED (requires SMTP in test environment)

PERFORMANCE (under 1,000 concurrent users)
Average response time: 234ms
95th percentile: 847ms
Error rate: 0.0%`,
    language: "text",
    timestamp: "3 hours ago",
    generatedBy: "QA Lead",
    phase: "Test",
  },
  {
    id: "artifact-evidence-1",
    storyId: "forge-story-1",
    projectId: "ndpp",
    title: "PDPL Evidence Pack",
    type: "evidence-pack",
    description: "Complete PDPL compliance evidence package for the Citizen Authentication Service release",
    codeSnippet: `PDPL EVIDENCE PACK
Project: National Digital Permits Platform
Story: Citizen Authentication Service
Generated: April 22, 2026
Proof chain completeness: 94%

EVIDENCE ITEMS (12 of 12)

1. PDPL Data Flow Mapping
   Author: Dana Youssef (Compliance Officer)
   Date: April 19, 2026
   Proof hash: c3d4e5f
   Status: Approved

2. Personal Data Processing Register
   Author: Dana Youssef (Compliance Officer)
   Date: April 19, 2026
   Proof hash: d4e5f6a
   Status: Approved

3. Consent Management Implementation
   Author: Omar Rahman (Developer)
   Date: April 20, 2026
   Proof hash: b2c3d4e
   Status: Approved

4. Session Expiry Notification
   Author: Dana Youssef (Compliance Officer)
   Date: April 21, 2026
   Proof hash: b4c5d6e
   Status: Approved

5. NCA ECC Control Verification
   Author: Khalid Al Rashid (Security Officer)
   Date: April 20, 2026
   Proof hash: e5f6a7b
   Status: Approved

6. Architecture Impact Assessment
   Author: Sara Malik (Solution Architect)
   Date: April 20, 2026
   Proof hash: a7b8c9d
   Status: Approved

APPROVAL CHAIN
Gate 4 (Compliance): Dana Youssef, Khalid Al Rashid
Gate 5 (Release): Omar Rahman, Sara Malik
Ministerial Sign Off: Received April 22, 2026`,
    timestamp: "1 hour ago",
    generatedBy: "Compliance Officer",
    phase: "Ship",
  },
  {
    id: "artifact-diagram-1",
    storyId: "forge-story-1",
    projectId: "ndpp",
    title: "Authentication Flow Diagram",
    type: "diagram",
    description: "Sequence diagram showing the full Nafath identity verification flow with PDPL consent gates",
    codeSnippet: `sequenceDiagram
    actor Citizen
    participant Portal as Citizen Portal
    participant ConsentMgr as PDPL Consent Manager
    participant Nafath as Nafath IdP
    participant ProofChain as Proof Chain

    Citizen->>Portal: Access digital service
    Portal->>ConsentMgr: Check existing consent
    ConsentMgr-->>Portal: Consent required
    Portal->>Citizen: Display PDPL consent screen
    Citizen->>Portal: Grant consent
    Portal->>ConsentMgr: Record consent with timestamp
    ConsentMgr->>ProofChain: Log consent event (hash: c3d4e5f)

    Portal->>Nafath: Initiate verification session
    Nafath-->>Portal: Session ID + QR code
    Portal->>Citizen: Display verification prompt
    Citizen->>Nafath: Approve via Nafath app
    Nafath->>Portal: Verification confirmed

    Portal->>ProofChain: Record identity verification
    ProofChain-->>Portal: Proof hash: a1b2c3d
    Portal->>Citizen: Access granted`,
    language: "mermaid",
    timestamp: "2 days ago",
    generatedBy: "AI Agent",
    phase: "Design",
  },
  {
    id: "artifact-live-permit-dashboard",
    storyId: "permit-intake",
    projectId: "ndpp",
    title: "Permit Management Dashboard",
    type: "live-preview",
    description: "Full permit management interface with application tracking and status management",
    previewComponent: "permit_dashboard",
    githubUrl: "https://github.com/TheArkitektai/Forge/tree/main/src/permits",
    timestamp: "1 day ago",
    generatedBy: "Development Agent",
    phase: "Develop",
  },
  {
    id: "artifact-live-2",
    storyId: "forge-story-3",
    projectId: "health-portal",
    title: "Citizen Health Portal",
    type: "live-preview",
    description: "Interactive preview of the health portal dashboard with appointment scheduling",
    previewUrl: "/demo/health-portal-preview",
    githubUrl: "https://github.com/TheArkitektai/arkitekt-forge-demo/tree/main/src/health",
    timestamp: "1 day ago",
    generatedBy: "Developer",
    phase: "Test",
  },
  {
    id: "artifact-live-3",
    storyId: "forge-story-5",
    projectId: "trade-license",
    title: "Trade License Application Form",
    type: "live-preview",
    description: "Business registration and trade license application flow with document upload",
    previewUrl: "/demo/trade-license-preview",
    githubUrl: "https://github.com/TheArkitektai/arkitekt-forge-demo/tree/main/src/trade",
    timestamp: "3 days ago",
    generatedBy: "Developer",
    phase: "Develop",
  },
  {
    id: "artifact-code-2",
    storyId: "forge-story-2",
    projectId: "citizen-id",
    title: "ProofChain.ts",
    type: "code",
    description: "Immutable proof chain implementation for governance evidence tracking",
    codeSnippet: `import crypto from 'crypto';

export class ProofChain {
  private entries: ProofEntry[] = [];

  append(data: ProofData): string {
    const previous = this.entries[this.entries.length - 1];
    const hash = this.computeHash({
      data,
      previousHash: previous?.hash ?? '0000000000000000',
      timestamp: new Date().toISOString(),
    });

    this.entries.push({ hash, data, timestamp: new Date().toISOString() });
    return hash;
  }

  verify(): boolean {
    for (let i = 1; i < this.entries.length; i++) {
      const expected = this.computeHash({
        data: this.entries[i].data,
        previousHash: this.entries[i - 1].hash,
        timestamp: this.entries[i].timestamp,
      });
      if (expected !== this.entries[i].hash) return false;
    }
    return true;
  }

  private computeHash(content: object): string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(content))
      .digest('hex')
      .slice(0, 8);
  }
}`,
    language: "typescript",
    githubUrl: "https://github.com/TheArkitektai/arkitekt-forge-demo/blob/main/src/governance/ProofChain.ts",
    timestamp: "2 days ago",
    generatedBy: "AI Agent",
    phase: "Develop",
  },
];
