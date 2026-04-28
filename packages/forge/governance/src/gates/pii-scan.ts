export interface PiiScanResult {
  passed: boolean;
  findings: string[];
  details: string;
}

export async function piiScanGate(_storyId: string, context: Record<string, unknown>): Promise<PiiScanResult> {
  // MVP: Check for common PII patterns in code/output
  const artifacts = (context.artifacts as string[]) || [];
  const findings: string[] = [];
  
  const piiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\b\d{16}\b/, // Credit card
    /\b\d{3}-\d{3}-\d{4}\b/, // Phone
  ];
  
  for (const artifact of artifacts) {
    for (const pattern of piiPatterns) {
      if (pattern.test(artifact)) {
        findings.push(`Potential PII detected in artifact matching ${pattern.source}`);
      }
    }
  }
  
  const passed = findings.length === 0;
  return {
    passed,
    findings,
    details: passed ? "No PII detected" : `PII findings: ${findings.join("; ")}`,
  };
}
