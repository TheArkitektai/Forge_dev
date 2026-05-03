import type { AIDemoScript } from "@/forge/types";

export const demoScripts: AIDemoScript[] = [
  {
    id: "brief-generation",
    title: "Story Brief Generation",
    trigger: "Generate a comprehensive brief for this story",
    agentStatus: ["thinking", "compiling-context", "generating", "complete"],
    toolCalls: [
      { tool: "context_graph_query", status: "complete", duration: "1.2s" },
      { tool: "proof_chain_verify", status: "complete", duration: "0.8s" },
      { tool: "write_file", status: "complete", duration: "0.3s" },
    ],
    sections: [
      {
        heading: "Context Compilation",
        content: "Analysed 142 memory artifacts across 3 related projects. Found 7 reusable patterns from the Citizen Identity Gateway project that apply directly to this authentication service. The Context Hub identified 3 lessons learned from the previous release cycle that should inform the design approach.\n\nKey patterns identified:\n\n1. Nafath integration pattern (reused from Citizen ID, confidence 94%)\n2. PDPL consent flow (validated across 4 projects, zero compliance exceptions)\n3. Session management architecture (adapted from Border Management, reviewed by Sara Malik)",
        type: "analysis",
      },
      {
        heading: "Architecture Impact Assessment",
        content: "This story impacts 3 of 8 architecture layers:\n\nLayer 1 (Customer Interaction): New authentication UI components required\nLayer 3 (Intelligence): Context compiler needs updated patterns for identity verification\nLayer 5 (Data and Context): Session storage schema changes required in PostgreSQL\n\nNo impact on Layer 4 (Governance) or Layer 7 (Workflow Engine). Existing approval gates are sufficient.",
        type: "analysis",
      },
      {
        heading: "Recommendation",
        content: "Proceed with the Nafath integration pattern from Citizen ID. The pattern has been validated across 4 deployments with zero security exceptions. Estimated 40% reduction in design time compared to building from scratch.\n\nSuggested assignees: Omar Rahman (development), Sara Malik (architecture review), Dana Youssef (compliance verification).",
        type: "recommendation",
      },
      {
        heading: "Governance Readiness",
        content: "Current proof chain completeness: 72%\nRequired evidence before design gate: Architecture impact assessment (this document), PDPL data flow mapping, Nafath API security review\nEstimated gate readiness: 2 working days",
        type: "evidence",
      },
    ],
    confidenceScore: 94,
  },
  {
    id: "architecture-impact",
    title: "Architecture Impact Analysis",
    trigger: "Analyse the architecture impact of this story",
    agentStatus: ["thinking", "compiling-context", "generating", "complete"],
    toolCalls: [
      { tool: "layer_dependency_scan", status: "complete", duration: "2.1s" },
      { tool: "service_boundary_check", status: "complete", duration: "1.4s" },
      { tool: "impact_report_write", status: "complete", duration: "0.5s" },
    ],
    sections: [
      {
        heading: "Layer Impact Summary",
        content: "Scanned all 8 architecture layers against the story scope. 4 layers are impacted:\n\nLayer 1 (Customer Interaction): Direct impact. New citizen authentication UI must conform to the ministry design system and meet WCAG 2.1 AA accessibility standards.\n\nLayer 2 (AI Orchestration): Indirect impact. The AI context compiler will need to index authentication patterns from this story for future reuse.\n\nLayer 5 (Data and Context): Direct impact. Session tokens, consent records, and Nafath verification results require new data models in the citizen profile schema.\n\nLayer 7 (Workflow Engine): Advisory impact. The approval gates for identity verification flows should be reviewed to ensure the new Nafath step is covered.",
        type: "analysis",
      },
      {
        heading: "Service Boundary Analysis",
        content: "This story introduces a new service boundary between the Citizen Portal and the Nafath Identity Provider. Key considerations:\n\nThe Nafath API call must be treated as an external dependency with retry logic and graceful degradation.\n\nConsent management cannot be delegated to the Nafath service. PDPL requires that consent records are maintained within the ministry data boundary.\n\nSession tokens must be encrypted at rest and in transit. The existing session management service can be extended rather than replaced.",
        type: "analysis",
      },
      {
        heading: "Risk Assessment",
        content: "Overall architecture risk: Low\n\nThe Nafath integration pattern is mature and has been deployed in 4 previous projects with no architectural exceptions. The session management extension adds 3 new fields to an existing schema, which is a backwards compatible change.\n\nOne area to monitor: the consent audit log volume may increase significantly if the citizen portal scales to national rollout. The current logging infrastructure should be capacity planned before go live.",
        type: "recommendation",
      },
      {
        heading: "Evidence Generated",
        content: "Architecture impact report has been written to the proof chain.\nProof hash: a7f3b2c1\nLayered impact map: Available in Output Viewer\nReview required from: Sara Malik (Solution Architect) before design gate",
        type: "evidence",
      },
    ],
    confidenceScore: 91,
  },
  {
    id: "governance-check",
    title: "Governance Readiness Check",
    trigger: "Check governance readiness for this story",
    agentStatus: ["thinking", "compiling-context", "generating", "complete"],
    toolCalls: [
      { tool: "proof_chain_audit", status: "complete", duration: "1.8s" },
      { tool: "compliance_gap_scan", status: "complete", duration: "2.3s" },
      { tool: "evidence_index_query", status: "complete", duration: "0.9s" },
    ],
    sections: [
      {
        heading: "Proof Chain Status",
        content: "Proof chain completeness: 78% (target: 100% before release gate)\n\nCompleted evidence items (9 of 12):\n1. Architecture impact assessment\n2. PDPL data flow mapping\n3. NCA ECC control verification\n4. Nafath API security review\n5. Unit test coverage report (94%)\n6. Integration test results (all passed)\n7. SonarQube quality gate (passed)\n8. Peer code review (approved by 2 reviewers)\n9. Accessibility compliance check\n\nOutstanding evidence (3 items):\n1. Performance load test under 10,000 concurrent users\n2. Disaster recovery runbook\n3. Ministerial sign off on consent language",
        type: "evidence",
      },
      {
        heading: "PDPL Compliance Gap Analysis",
        content: "PDPL alignment score: 92%\n\nAll 7 personal data processing activities have documented consent and purpose limitation.\n\nOne gap identified: The session expiry notification to citizens is not yet implemented. PDPL Article 17 requires that data subjects are notified when their session data is about to be deleted. Estimated fix: 4 hours of development, 1 hour of compliance review.",
        type: "analysis",
      },
      {
        heading: "NCA ECC Control Status",
        content: "NCA ECC alignment: 96%\n\nAll critical and high severity controls are satisfied. One medium severity advisory: Multi factor authentication fallback mechanism needs documentation. The Nafath app is the primary MFA channel, but the fallback to OTP via SMS must be documented in the security design.",
        type: "analysis",
      },
      {
        heading: "Release Gate Recommendation",
        content: "This story is not yet ready for the compliance gate. Estimated readiness: 3 working days.\n\nRecommended actions in priority order:\n1. Implement session expiry notification (resolves PDPL gap)\n2. Complete performance load test\n3. Document MFA fallback in security design\n4. Obtain ministerial sign off on consent language\n\nAll 4 actions can proceed in parallel. Dana Youssef (Compliance) and Sara Malik (Architecture) should be assigned to items 1 and 3 respectively.",
        type: "recommendation",
      },
    ],
    confidenceScore: 88,
  },
  {
    id: "code-review",
    title: "AI Assisted Code Review",
    trigger: "Review the code changes in this story",
    agentStatus: ["thinking", "compiling-context", "generating", "complete"],
    toolCalls: [
      { tool: "github_diff_fetch", status: "complete", duration: "1.1s" },
      { tool: "security_pattern_scan", status: "complete", duration: "3.2s" },
      { tool: "code_quality_check", status: "complete", duration: "1.7s" },
    ],
    sections: [
      {
        heading: "Code Change Summary",
        content: "Reviewed 12 files changed across 847 additions and 23 deletions on branch feature/nafath-integration.\n\nFiles reviewed:\n1. src/auth/NafathProvider.ts (new file, 4.2 KB)\n2. src/auth/SessionManager.ts (modified, 3.8 KB)\n3. src/auth/PDPLConsentFlow.ts (new file, 2.1 KB)\n4. src/api/routes.ts (modified, adding 3 new endpoints)\n5. src/api/middleware.ts (modified, adding consent validation)\n8 supporting test files",
        type: "analysis",
      },
      {
        heading: "Security Findings",
        content: "Security scan completed. No critical findings.\n\n1 High severity advisory: The NafathProvider retry logic does not implement exponential backoff. If the Nafath service is unavailable, rapid retries could cause the citizen portal to be flagged as an abusive client by the Nafath API gateway. Recommend adding backoff with jitter.\n\n1 Medium severity advisory: The session token in SessionManager.ts is 128 bits. NCA ECC recommends 256 bits for tokens with a lifetime exceeding 15 minutes.\n\n3 Low severity notes: Logging of national IDs should be masked in production logs. Error messages in the consent flow expose internal exception types. Missing rate limiting on the identity verification endpoint.",
        type: "analysis",
      },
      {
        heading: "Code Quality Assessment",
        content: "SonarQube quality gate: Passed\nCoverage: 94% (threshold: 80%)\nDuplications: 0%\nCode smells: 2 minor\n\nThe code structure is clean and follows the existing patterns in the repository. The PDPLConsentFlow class correctly separates consent validation from session management. The dependency injection pattern is consistent with the existing codebase.",
        type: "metric",
      },
      {
        heading: "Recommendation",
        content: "Approve with 2 required changes before merge:\n\n1. Implement exponential backoff in NafathProvider (estimated 1 hour)\n2. Increase session token entropy to 256 bits in SessionManager (estimated 30 minutes)\n\nThe 3 low severity items should be created as separate improvement stories and added to the backlog rather than blocking this merge. The core implementation is solid and reuses the PDPL consent pattern from the Citizen ID project correctly.",
        type: "recommendation",
      },
    ],
    confidenceScore: 89,
  },
  {
    id: "release-readiness",
    title: "Release Readiness Assessment",
    trigger: "Assess release readiness for this story",
    agentStatus: ["thinking", "compiling-context", "generating", "complete"],
    toolCalls: [
      { tool: "release_evidence_collate", status: "complete", duration: "2.8s" },
      { tool: "gate_status_check", status: "complete", duration: "1.3s" },
      { tool: "confidence_score_calculate", status: "complete", duration: "0.6s" },
    ],
    sections: [
      {
        heading: "Release Confidence Score",
        content: "Overall release confidence: 94%\n\nScore breakdown:\nGovernance gates passed: 5 of 5 (100%)\nProof chain completeness: 94%\nTest coverage: 94%\nSecurity scan: Passed (2 resolved, 0 open)\nCompliance alignment: PDPL 98%, NCA ECC 96%\nPerformance baseline: All thresholds met under 5,000 concurrent users",
        type: "metric",
      },
      {
        heading: "Gate Summary",
        content: "All 5 governance gates have been passed:\n\nGate 1 (Plan to Design): Approved by Sara Malik on April 19, 2026\nGate 2 (Design to Build): Approved by Sara Malik and Ahmad Karimi on April 20, 2026\nGate 3 (Build to Test): Approved by Reem Al Saud on April 21, 2026\nGate 4 (Test to Compliance): Approved by Dana Youssef and Khalid Al Rashid on April 21, 2026\nGate 5 (Compliance to Release): Approved by Omar Rahman and Sara Malik on April 22, 2026",
        type: "evidence",
      },
      {
        heading: "Evidence Pack",
        content: "Complete evidence pack is ready for export:\n\n12 evidence items in proof chain\nTotal artifacts: 8 (architecture assessment, PDPL mapping, test reports, security review, performance baseline, compliance verification, code review records, ministerial sign off)\n\nEvidence pack can be exported in PDF, JSON, or CSV format. PDPL and NCA ECC templates are pre populated.",
        type: "evidence",
      },
      {
        heading: "Release Recommendation",
        content: "This story is clear to release. All governance gates are passed, the proof chain is 94% complete (above the 90% threshold for this project), and all compliance requirements are satisfied.\n\nRecommended release window: Next scheduled deployment on Thursday April 23, 2026 at 02:00 AST. The GCP me-central2 deployment is already configured and the rollback plan is documented.\n\nPost release: Monitor citizen authentication success rate for the first 24 hours. The Nafath service has a published SLA of 99.5% uptime.",
        type: "recommendation",
      },
    ],
    confidenceScore: 94,
  },
  {
    id: "context-compilation",
    title: "Cross Project Context Compilation",
    trigger: "Compile context from related projects",
    agentStatus: ["thinking", "compiling-context", "generating", "complete"],
    toolCalls: [
      { tool: "memory_graph_traverse", status: "complete", duration: "3.4s" },
      { tool: "pattern_similarity_score", status: "complete", duration: "2.1s" },
      { tool: "knowledge_transfer_map", status: "complete", duration: "1.2s" },
    ],
    sections: [
      {
        heading: "Cross Project Memory Analysis",
        content: "Analysed 4 related projects in the Ministry of Interior tenant. Found 23 directly reusable patterns, 14 applicable lessons learned, and 8 validated evidence artifacts that can be cited in this project's proof chain.\n\nRelated projects scanned:\n1. Citizen Identity Gateway (89 memory events, 7 reusable patterns)\n2. Border Management Modernization (34 memory events, 3 reusable patterns)\n3. National Digital Permits Platform (142 memory events, 13 reusable patterns)\n4. Health Claims Processing Engine (cross tenant, 56 memory events, 4 applicable patterns)",
        type: "analysis",
      },
      {
        heading: "Top Reusable Patterns",
        content: "Highest confidence patterns for this story:\n\n1. Nafath Identity Verification Flow (confidence: 94%, source: Citizen ID, used in 4 projects)\n2. PDPL Consent Manager Pattern (confidence: 97%, source: National Permits, used in 6 projects)\n3. Government Portal Session Architecture (confidence: 88%, source: Border Management, used in 3 projects)\n4. NCA ECC Control Checklist Template (confidence: 100%, source: Compliance Team, used in all projects)\n5. Ministerial Approval Evidence Template (confidence: 91%, source: National Permits, used in 5 projects)",
        type: "analysis",
      },
      {
        heading: "Lessons Learned Transfer",
        content: "3 critical lessons from related projects apply directly:\n\nLesson 1 (from Citizen ID): Nafath session tokens expire after 60 seconds in the sandbox environment but 10 minutes in production. Test against production timing to avoid incorrect timeout handling.\n\nLesson 2 (from Border Management): The PDPL consent record must be stored before any biometric data is processed, not concurrently. Parallel processing caused an audit trail gap that required a retrospective fix.\n\nLesson 3 (from National Permits): The ministerial design system font requires an Arabic font fallback that is not included in the standard GCP CDN configuration. Add the font to the asset manifest before the first staging deployment.",
        type: "recommendation",
      },
      {
        heading: "Compounding Value Report",
        content: "Applying these 23 reusable patterns and lessons is projected to save:\n\nDesign time: 18 hours (40% reduction)\nDevelopment time: 32 hours (35% reduction)\nCompliance review time: 8 hours (50% reduction)\nTotal estimated saving: 58 hours across the delivery team\n\nThis story will itself generate approximately 12 new memory artifacts that will be available to future projects in this tenant.",
        type: "metric",
      },
    ],
    confidenceScore: 96,
  },
  {
    id: "execute-code",
    title: "Execute Code from Design Artifact",
    trigger: "Generate implementation from approved design artifact",
    agentStatus: ["thinking", "compiling-context", "generating-code", "testing", "iterating", "complete"],
    toolCalls: [
      { tool: "read_design_artifact", status: "complete", duration: "0.8s" },
      { tool: "context_budget_allocate", status: "complete", duration: "0.3s" },
      { tool: "generate_code_sandbox", status: "complete", duration: "12.4s" },
      { tool: "run_test_suite", status: "complete", duration: "8.2s" },
      { tool: "fix_failing_tests", status: "complete", duration: "6.7s" },
      { tool: "generate_explainability_report", status: "complete", duration: "3.1s" },
      { tool: "create_pull_request", status: "complete", duration: "1.4s" },
    ],
    sections: [
      {
        heading: "Design Artifact Loaded",
        content: "Loaded approved design artifact: Citizen Authentication Portal v2.\n\nKey constraints extracted:\n1. OTP over SMS as primary second factor\n2. Biometric fallback via Nafath\n3. Session tokens in httpOnly cookies\n4. Rate limiting at gateway layer\n\nContext budget allocated: 128k tokens\nDesign artifact: 51.2k (40%)\nCodebase understanding: 32k (25%)\nRelated patterns: 25.6k (20%)\nGovernance rules: 19.2k (15%)",
        type: "analysis",
      },
      {
        heading: "Code Generated in Sandbox",
        content: "Generated 6 files in sandbox environment sb-forge-001:\n\nsrc/auth/CitizenAuthController.ts\nsrc/auth/OtpService.ts\nsrc/auth/SessionManager.ts\nsrc/auth/BiometricFallbackHandler.ts\ntests/auth/CitizenAuthController.test.ts\ntests/auth/OtpService.test.ts\n\nAll files follow the existing project structure and coding standards. TypeScript strict mode enabled. No lint errors.",
        type: "code",
      },
      {
        heading: "Test Results: 2 Failures Detected",
        content: "Test suite executed: 20 tests total\nPassed: 18\nFailed: 2\n\nFailure 1: OTP retry logic does not reset counter after successful verification. The retry counter persists across sessions, causing false lockouts.\n\nFailure 2: Session expiry edge case at exactly 24 hours triggers a race condition between refresh and expiry checks.\n\nToken usage: 82.4k / 128k budget. 3 iterations remaining.",
        type: "analysis",
      },
      {
        heading: "Iteration Complete: All Tests Passing",
        content: "Fixed both failures:\n\nFix 1: Added explicit retry counter reset in OtpService.verify() after successful OTP validation. Added regression test.\n\nFix 2: Changed session expiry check from exact timestamp comparison to 5 second grace window. Updated SessionManager tests.\n\nFinal test results: 20 passed, 0 failed\nCoverage: 94%\nSecurity scan: clean\nGovernance checks: all passed",
        type: "recommendation",
      },
      {
        heading: "Pull Request Created",
        content: "Explainability report generated with 91% confidence score.\n\nPull request #412 created: feature/citizen-auth-module\n\nAll 4 design decisions documented with rationale.\nGovernance checks passed: PDPL, NCA ECC, OWASP, code review gate, coverage minimum, dependency scan.\n\nAwaiting human approval before merge.",
        type: "evidence",
      },
    ],
    confidenceScore: 91,
  },
];
