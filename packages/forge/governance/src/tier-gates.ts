export type GateKey = "pii_scan" | "code_quality" | "test_coverage" | "security_scan" | "hallucination_check" | "license_scan" | "accessibility_check" | "performance_budget" | "dependency_check" | "api_contract_check";

const TIER_GATES: Record<string, GateKey[]> = {
  forge_team: ["pii_scan", "code_quality", "test_coverage"],
  forge_enterprise: ["pii_scan", "code_quality", "test_coverage", "security_scan", "hallucination_check", "license_scan", "accessibility_check", "performance_budget", "dependency_check", "api_contract_check"],
  forge_partner: ["pii_scan", "code_quality", "test_coverage", "security_scan", "hallucination_check", "license_scan", "accessibility_check", "performance_budget", "dependency_check", "api_contract_check"],
  forge_sovereign: ["pii_scan", "code_quality", "test_coverage", "security_scan", "hallucination_check", "license_scan", "accessibility_check", "performance_budget", "dependency_check", "api_contract_check"],
};

export function getGatesForTier(tierSlug: string): GateKey[] {
  return TIER_GATES[tierSlug] || TIER_GATES.forge_team;
}

export function isGateAvailable(gate: GateKey, tierSlug: string): boolean {
  return getGatesForTier(tierSlug).includes(gate);
}
