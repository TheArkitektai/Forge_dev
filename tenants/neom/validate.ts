/* NEOM Phase 1 Validation Script */
import { registry } from "@forge/connector-framework";
import { getTemplatesForTier } from "@forge/workflow";
import { getGatesForTier } from "@forge/governance";
import config from "./config.json" assert { type: "json" };

export interface ValidationResult {
  check: string;
  passed: boolean;
  message: string;
}

export function validateNeomConfig(): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // 1. Tier validation
  const templates = getTemplatesForTier(config.subscription.tier);
  results.push({
    check: "tier_templates",
    passed: templates.length > 0,
    message: `Tier ${config.subscription.tier} has ${templates.length} available templates`,
  });
  
  // 2. Gate validation
  const gates = getGatesForTier(config.subscription.tier);
  const requiredGates = config.governance.requiredGates;
  const missingGates = requiredGates.filter((g: string) => !gates.includes(g as any));
  results.push({
    check: "gates",
    passed: missingGates.length === 0,
    message: missingGates.length === 0
      ? "All required gates available"
      : `Missing gates: ${missingGates.join(", ")}`,
  });
  
  // 3. Connector validation
  for (const connector of config.connectors) {
    const manifest = registry.get(connector.id);
    results.push({
      check: `connector_${connector.id}`,
      passed: !!manifest,
      message: manifest
        ? `Connector ${connector.id} (${manifest.name}) registered`
        : `Connector ${connector.id} NOT registered`,
    });
  }
  
  // 4. Gap closure validation
  for (const [gapId, gap] of Object.entries(config.gapClosures as Record<string, { module: string; status: string }>)) {
    results.push({
      check: `gap_${gapId}`,
      passed: gap.status === "configured" || gap.status === "complete",
      message: `Gap ${gapId} (${gap.module}): ${gap.status}`,
    });
  }
  
  // 5. Subscription allocation validation
  const custom = config.subscription.customAllocation;
  results.push({
    check: "allocation",
    passed: custom.includedTokensMonthly >= 100000000,
    message: `Included tokens: ${custom.includedTokensMonthly.toLocaleString()}/month`,
  });
  
  return results;
}

if (import.meta.main) {
  const results = validateNeomConfig();
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`NEOM Phase 1 Validation: ${passed}/${total} checks passed\n`);
  for (const r of results) {
    console.log(`[${r.passed ? "PASS" : "FAIL"}] ${r.check}: ${r.message}`);
  }
  process.exit(passed === total ? 0 : 1);
}
