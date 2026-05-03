import { piiScanGate } from "./pii-scan.js";
import { codeQualityGate } from "./code-quality.js";
import { testCoverageGate } from "./test-coverage.js";

export const GATE_IMPLEMENTATIONS = {
  pii_scan: piiScanGate,
  code_quality: codeQualityGate,
  test_coverage: testCoverageGate,
};

export { piiScanGate, codeQualityGate, testCoverageGate };
