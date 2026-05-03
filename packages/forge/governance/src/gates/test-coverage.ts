export interface TestCoverageResult {
  passed: boolean;
  coverage: number;
  details: string;
}

export async function testCoverageGate(_storyId: string, context: Record<string, unknown>): Promise<TestCoverageResult> {
  const coverage = (context.coverage as number) ?? 0;
  const threshold = (context.coverageThreshold as number) ?? 60;
  const passed = coverage >= threshold;
  
  return {
    passed,
    coverage,
    details: passed
      ? `Test coverage ${coverage}% meets threshold ${threshold}%`
      : `Test coverage ${coverage}% below threshold ${threshold}%`,
  };
}
