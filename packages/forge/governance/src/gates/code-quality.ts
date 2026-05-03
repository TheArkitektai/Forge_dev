export interface CodeQualityResult {
  passed: boolean;
  score: number;
  issues: string[];
  details: string;
}

export async function codeQualityGate(_storyId: string, context: Record<string, unknown>): Promise<CodeQualityResult> {
  const code = (context.code as string) || "";
  const issues: string[] = [];
  let score = 100;
  
  // Basic checks
  if (code.length > 5000) {
    issues.push("File exceeds recommended length (5000 chars)");
    score -= 10;
  }
  if ((code.match(/TODO|FIXME|HACK/gi) || []).length > 3) {
    issues.push("Too many TODO/FIXME/HACK comments");
    score -= 15;
  }
  if (!code.includes("test") && !code.includes("spec")) {
    issues.push("No test references found");
    score -= 20;
  }
  if ((code.match(/console\.(log|warn|error)/g) || []).length > 0) {
    issues.push("Console statements found in code");
    score -= 10;
  }
  
  const passed = score >= 70;
  return {
    passed,
    score: Math.max(0, score),
    issues,
    details: passed
      ? `Code quality score: ${score}/100`
      : `Code quality score: ${score}/100 — issues: ${issues.join("; ")}`,
  };
}
