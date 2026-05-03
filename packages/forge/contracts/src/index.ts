/* ────────────────────────────────────────────────────────────────
   @forge/contracts — Shared Types for Arkitekt Forge Platform
   Architecture v12 Aligned
   ──────────────────────────────────────────────────────────────── */

/* ── Core Identity ── */

export type UUID = string;

export type Timestamp = string; // ISO 8601

export interface Organization {
  id: UUID;
  name: string;
  slug: string;
  region: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface User {
  id: UUID;
  organizationId: UUID;
  email: string;
  name: string;
  roleId: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type RoleKey =
  | "platform_admin"
  | "tenant_admin"
  | "project_lead"
  | "developer"
  | "viewer";

export interface Role {
  id: UUID;
  key: RoleKey;
  name: string;
  permissions: PermissionKey[];
}

export type PermissionKey =
  | "org:read"
  | "org:write"
  | "project:create"
  | "project:read"
  | "project:write"
  | "project:delete"
  | "story:create"
  | "story:read"
  | "story:write"
  | "story:delete"
  | "subscription:read"
  | "subscription:write"
  | "budget:read"
  | "budget:write"
  | "agent:execute"
  | "agent:configure"
  | "admin:tiers"
  | "admin:tenants"
  | "admin:overrides";

/* ── Project and Story ── */

export type StoryPhase = "Plan" | "Design" | "Develop" | "Test" | "Ship" | "Operate";

export type RiskLevel = "Low" | "Medium" | "High";

export interface Project {
  id: UUID;
  organizationId: UUID;
  name: string;
  description: string;
  phase: StoryPhase;
  status: "Active" | "Planning" | "Completed" | "On hold";
  ownerId: UUID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Story {
  id: UUID;
  projectId: UUID;
  title: string;
  description: string;
  phase: StoryPhase;
  ownerId: UUID;
  risk: RiskLevel;
  confidence: number; // 0-100
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/* ── State Machine ── */

export type PhaseState =
  | "backlog"
  | "ready"
  | "in_progress"
  | "review"
  | "approved"
  | "rejected"
  | "completed"
  | "blocked";

export interface StateTransition {
  id: UUID;
  storyId: UUID;
  fromPhase: StoryPhase;
  toPhase: StoryPhase;
  fromState: PhaseState;
  toState: PhaseState;
  triggeredBy: UUID; // userId
  approvedBy?: UUID;
  timestamp: Timestamp;
  proofHash: string;
}

export interface Gate {
  id: UUID;
  name: string;
  type: "blocking" | "advisory";
  checkFn: string; // reference to registered check function
  requiredApprovers: number;
  allowedRoles: RoleKey[];
}

export interface GateResult {
  gateId: UUID;
  storyId: UUID;
  passed: boolean;
  score?: number; // 0-100 for advisory gates
  details: string;
  executedAt: Timestamp;
  executedBy: UUID;
}

export type ApprovalAction = "approve" | "reject" | "defer" | "escalate";

export interface ApprovalRecord {
  id: UUID;
  gateResultId: UUID;
  action: ApprovalAction;
  actorId: UUID;
  reason?: string;
  timestamp: Timestamp;
}

/* ── Agent Execution ── */

export type AgentStatus =
  | "idle"
  | "compiling_context"
  | "executing"
  | "awaiting_review"
  | "completed"
  | "failed"
  | "escalated";

export interface AgentExecution {
  id: UUID;
  storyId: UUID;
  organizationId: UUID;
  status: AgentStatus;
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  startedAt: Timestamp;
  completedAt?: Timestamp;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolResult {
  tool: string;
  success: boolean;
  result: unknown;
  durationMs: number;
}

export interface ContextBrief {
  storyId: UUID;
  projectId: UUID;
  organizationId: UUID;
  relevantArtifacts: UUID[];
  memoryEntries: UUID[];
  policyConstraints: string[];
}

export interface TokenBudget {
  total: number;
  used: number;
  ceiling: number;
  breakdown: {
    designArtifact: { allocated: number; used: number };
    codebaseUnderstanding: { allocated: number; used: number };
    relatedPatterns: { allocated: number; used: number };
    governanceRules: { allocated: number; used: number };
  };
}

/* ── Governance ── */

export interface ProofChainEntry {
  id: UUID;
  storyId: UUID;
  previousHash: string;
  data: string;
  hash: string;
  timestamp: Timestamp;
  signedBy: UUID;
}

export interface AuditEvent {
  id: UUID;
  organizationId: UUID;
  projectId?: UUID;
  storyId?: UUID;
  type:
    | "state_change"
    | "approval"
    | "agent_action"
    | "config_change"
    | "connector_event"
    | "evidence_generated";
  title: string;
  detail: string;
  actorId: UUID;
  actorRole: RoleKey;
  timestamp: Timestamp;
  proofHash: string;
}

export interface EvidencePack {
  id: UUID;
  storyId: UUID;
  format: "PDF" | "JSON" | "CSV";
  scope: "story" | "project" | "organization";
  generatedAt: Timestamp;
  downloadUrl: string;
}

/* ── Subscription and Metering ── */

export type SubscriptionTierSlug =
  | "forge_team"
  | "forge_enterprise"
  | "forge_partner"
  | "forge_sovereign";

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "grace_period"
  | "suspended"
  | "terminated"
  | "upgraded"
  | "downgraded";

export interface SubscriptionTier {
  id: UUID;
  slug: SubscriptionTierSlug;
  name: string;
  annualPriceUsd: number;
  monthlyPriceUsd: number;
  includedTokensMonthly: number;
  overageRatePerMillion: number;
  hardCapTokensMonthly: number;
  maxProjects: number;
  maxUsers: number;
  maxConcurrentAgents: number;
  gracePeriodDays: number;
  dataRetentionDays: number;
  features: Record<string, boolean>;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Subscription {
  id: UUID;
  organizationId: UUID;
  tierId: UUID;
  status: SubscriptionStatus;
  startedAt: Timestamp;
  expiresAt: Timestamp;
  gracePeriodDays: number;
  billingCycle: "monthly" | "annual";
  paymentMethodId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TokenUsageEvent {
  id: UUID;
  organizationId: UUID;
  projectId?: UUID;
  storyId?: UUID;
  agentExecutionId?: UUID;
  modelProvider: string;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  costAtProviderRate: number;
  costAtCustomerRate: number;
  createdAt: Timestamp;
}

export interface TokenUsageDaily {
  organizationId: UUID;
  projectId?: UUID;
  date: string; // YYYY-MM-DD
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostProvider: number;
  totalCostCustomer: number;
  storyCount: number;
  executionCount: number;
}

export interface TokenUsageMonthly {
  organizationId: UUID;
  projectId?: UUID;
  month: string; // YYYY-MM
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostProvider: number;
  totalCostCustomer: number;
  includedAllocation: number;
  overageTokens: number;
  overageCost: number;
}

export type BudgetScope = "organization" | "project" | "team";

export type OnLimitReached = "block" | "alert_continue" | "auto_upgrade";

export interface TenantBudget {
  id: UUID;
  organizationId: UUID;
  scopeType: BudgetScope;
  scopeId: UUID;
  monthlyTokenLimit: number;
  alertThresholdPct1: number;
  alertThresholdPct2: number;
  alertThresholdPct3: number;
  onLimitReached: OnLimitReached;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BillingInvoice {
  id: UUID;
  organizationId: UUID;
  subscriptionId: UUID;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  baseAmount: number;
  overageAmount: number;
  totalAmount: number;
  currency: string;
  status: "draft" | "open" | "paid" | "overdue" | "void";
  stripeInvoiceId?: string;
  createdAt: Timestamp;
}

export interface MeteringCheckResult {
  allowed: boolean;
  organizationId: UUID;
  currentUsage: number;
  monthlyLimit: number;
  remaining: number;
  usagePercent: number;
  warningThreshold?: number;
  hardCapThreshold?: number;
  model?: string;
  estimatedCost?: number;
}

export interface SubscriptionEvent {
  id: UUID;
  organizationId: UUID;
  subscriptionId: UUID;
  eventType:
    | "created"
    | "activated"
    | "renewed"
    | "upgraded"
    | "downgraded"
    | "grace_entered"
    | "suspended"
    | "terminated"
    | "payment_received"
    | "payment_failed"
    | "allocation_changed"
    | "overage_triggered";
  details: Record<string, unknown>;
  createdAt: Timestamp;
}

/* ── Events ── */

export interface MeteringEventPayload {
  type: "token_consumed" | "budget_alert" | "budget_exceeded" | "subscription_changed";
  organizationId: UUID;
  payload: Record<string, unknown>;
  timestamp: Timestamp;
}

/* ── API Response Types ── */

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
