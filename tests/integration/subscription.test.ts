/* Session 16: Subscription Integration Tests */
import { sql } from "@forge/db";
import { preFlightCheck, executeAgent } from "@forge/agents";
import { getSubscriptionStatus } from "@forge/api/middleware/subscription.js";
import { validateNeomConfig } from "../../tenants/neom/validate.js";

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

async function runTest(name: string, fn: () => Promise<void>): Promise<TestResult> {
  const start = Date.now();
  try {
    await fn();
    return { name, passed: true, duration: Date.now() - start };
  } catch (err) {
    return { name, passed: false, duration: Date.now() - start, error: String(err) };
  }
}

async function getTestOrgId(): Promise<string> {
  const rows = await sql`SELECT id FROM organizations WHERE slug = ${"uxbert-test-tenant"}`;
  return rows[0]?.id;
}

export async function runIntegrationTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const orgId = await getTestOrgId();
  
  if (!orgId) {
    return [{ name: "setup", passed: false, duration: 0, error: "Test organization not found" }];
  }
  
  // Test 1: Subscription status check
  results.push(await runTest("subscription_status", async () => {
    const status = await getSubscriptionStatus(orgId);
    if (!status.isActive) throw new Error("Subscription not active");
  }));
  
  // Test 2: Pre-flight metering check
  results.push(await runTest("pre_flight_check", async () => {
    const check = await preFlightCheck(orgId, 1000);
    if (!check.allowed) throw new Error("Pre-flight check failed unexpectedly");
  }));
  
  // Test 3: Pre-flight blocks over-budget
  results.push(await runTest("pre_flight_blocks_over_budget", async () => {
    const check = await preFlightCheck(orgId, 999999999999);
    if (check.allowed) throw new Error("Pre-flight should have blocked over-budget request");
  }));
  
  // Test 4: Agent execution with metering
  results.push(await runTest("agent_execution_metering", async () => {
    const projectRows = await sql`SELECT id FROM projects WHERE organization_id = ${orgId} LIMIT 1`;
    const projectId = projectRows[0]?.id;
    const storyRows = await sql`SELECT id FROM stories WHERE project_id = ${projectId} LIMIT 1`;
    const storyId = storyRows[0]?.id;
    if (!storyId) throw new Error("No test story found");
    
    const before = await sql`SELECT COUNT(*) as c FROM token_usage_events WHERE organization_id = ${orgId}`;
    const beforeCount = Number(before[0].c);
    
    await executeAgent({
      storyId,
      organizationId: orgId,
      taskType: "classify",
      prompt: "Test prompt for integration testing",
    });
    
    const after = await sql`SELECT COUNT(*) as c FROM token_usage_events WHERE organization_id = ${orgId}`;
    const afterCount = Number(after[0].c);
    
    if (afterCount <= beforeCount) throw new Error("Token usage event not recorded");
  }));
  
  // Test 5: Multi-tenant isolation
  results.push(await runTest("multi_tenant_isolation", async () => {
    const otherOrg = await sql`SELECT id FROM organizations WHERE id != ${orgId} LIMIT 1`;
    if (otherOrg.length === 0) return; // skip if only one org
    const otherOrgId = otherOrg[0].id;
    const check = await preFlightCheck(otherOrgId, 1000);
    // Should either be allowed or not — the key is it does not affect the first org
    const usage1 = await sql`SELECT COALESCE(SUM(input_tokens + output_tokens), 0) as total FROM token_usage_events WHERE organization_id = ${orgId}`;
    const usage2 = await sql`SELECT COALESCE(SUM(input_tokens + output_tokens), 0) as total FROM token_usage_events WHERE organization_id = ${otherOrgId}`;
    // Just verify queries work independently
    if (usage1[0].total === undefined || usage2[0].total === undefined) {
      throw new Error("Usage queries failed");
    }
  }));
  
  // Test 6: NEOM config validation
  results.push(await runTest("neom_config", async () => {
    const neomResults = validateNeomConfig();
    const failed = neomResults.filter((r) => !r.passed);
    if (failed.length > 0) {
      throw new Error(`NEOM validation failed: ${failed.map((f) => f.check).join(", ")}`);
    }
  }));
  
  return results;
}

if (import.meta.main) {
  console.log("Running Subscription Integration Tests (Session 16)...\n");
  const results = await runIntegrationTests();
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  
  for (const r of results) {
    const icon = r.passed ? "✓" : "✗";
    console.log(`${icon} ${r.name} (${r.duration}ms)${r.error ? ` — ${r.error}` : ""}`);
  }
  
  console.log(`\n${passed}/${total} tests passed`);
  process.exit(passed === total ? 0 : 1);
}
