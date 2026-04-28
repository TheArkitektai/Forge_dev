import { Queue, Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { sql } from "@forge/db";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const AGGREGATION_QUEUE_NAME = "subscription:daily-aggregation";

export interface AggregationJob {
  type: "rolling" | "daily-reconcile";
  organizationId?: string;
  date?: string;
}

export const aggregationQueue = new Queue<AggregationJob>(AGGREGATION_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
});

async function runRollingAggregation(): Promise<void> {
  const since = new Date(Date.now() - 120_000);
  const rows = await sql`
    SELECT
      organization_id,
      COALESCE(project_id, '00000000-0000-0000-0000-000000000000') as project_id,
      DATE(created_at) AS date,
      SUM(input_tokens)        AS total_input_tokens,
      SUM(output_tokens)       AS total_output_tokens,
      SUM(cost_at_provider_rate) AS total_cost_provider,
      SUM(cost_at_customer_rate) AS total_cost_customer,
      COUNT(DISTINCT story_id) AS story_count,
      COUNT(DISTINCT agent_execution_id) AS execution_count
    FROM token_usage_events
    WHERE created_at >= ${since}
    GROUP BY organization_id, project_id, DATE(created_at)
  `;
  for (const row of rows) {
    await sql`
      INSERT INTO token_usage_daily (
        organization_id, project_id, date,
        total_input_tokens, total_output_tokens,
        total_cost_provider, total_cost_customer,
        story_count, execution_count
      ) VALUES (
        ${row.organization_id}, ${row.project_id}, ${row.date},
        ${row.total_input_tokens}, ${row.total_output_tokens},
        ${row.total_cost_provider}, ${row.total_cost_customer},
        ${row.story_count}, ${row.execution_count}
      )
      ON CONFLICT (organization_id, project_id, date)
      DO UPDATE SET
        total_input_tokens  = EXCLUDED.total_input_tokens,
        total_output_tokens = EXCLUDED.total_output_tokens,
        total_cost_provider = EXCLUDED.total_cost_provider,
        total_cost_customer = EXCLUDED.total_cost_customer,
        story_count         = EXCLUDED.story_count,
        execution_count     = EXCLUDED.execution_count
    `;
  }
}

async function runDailyReconcile(targetDate?: string): Promise<void> {
  const date = targetDate || new Date().toISOString().slice(0, 10);
  const rows = await sql`
    SELECT
      organization_id,
      COALESCE(project_id, '00000000-0000-0000-0000-000000000000') as project_id,
      DATE(created_at) AS date,
      SUM(input_tokens)        AS total_input_tokens,
      SUM(output_tokens)       AS total_output_tokens,
      SUM(cost_at_provider_rate) AS total_cost_provider,
      SUM(cost_at_customer_rate) AS total_cost_customer,
      COUNT(DISTINCT story_id) AS story_count,
      COUNT(DISTINCT agent_execution_id) AS execution_count
    FROM token_usage_events
    WHERE DATE(created_at) = ${date}
    GROUP BY organization_id, project_id, DATE(created_at)
  `;
  for (const row of rows) {
    await sql`
      INSERT INTO token_usage_daily (
        organization_id, project_id, date,
        total_input_tokens, total_output_tokens,
        total_cost_provider, total_cost_customer,
        story_count, execution_count
      ) VALUES (
        ${row.organization_id}, ${row.project_id}, ${row.date},
        ${row.total_input_tokens}, ${row.total_output_tokens},
        ${row.total_cost_provider}, ${row.total_cost_customer},
        ${row.story_count}, ${row.execution_count}
      )
      ON CONFLICT (organization_id, project_id, date)
      DO UPDATE SET
        total_input_tokens  = EXCLUDED.total_input_tokens,
        total_output_tokens = EXCLUDED.total_output_tokens,
        total_cost_provider = EXCLUDED.total_cost_provider,
        total_cost_customer = EXCLUDED.total_cost_customer,
        story_count         = EXCLUDED.story_count,
        execution_count     = EXCLUDED.execution_count
    `;
  }
}

export const aggregationWorker = new Worker<AggregationJob>(
  AGGREGATION_QUEUE_NAME,
  async (job: Job<AggregationJob>) => {
    if (job.data.type === "rolling") {
      await runRollingAggregation();
    } else if (job.data.type === "daily-reconcile") {
      await runDailyReconcile(job.data.date);
    }
  },
  { connection: redis, concurrency: 1 }
);

aggregationWorker.on("completed", (job) => {
  console.log(`[aggregationWorker] completed job ${job.id} (${job.data.type})`);
});

aggregationWorker.on("failed", (job, err) => {
  console.error(`[aggregationWorker] failed job ${job?.id} (${job?.data.type}):`, err.message);
});

export async function scheduleRollingAggregation(): Promise<void> {
  await aggregationQueue.add(
    "rolling-30s",
    { type: "rolling" },
    { repeat: { every: 30_000 }, jobId: "rolling-30s" }
  );
}

export async function scheduleDailyReconcile(hourUTC = 1, minuteUTC = 0): Promise<void> {
  const cron = `${minuteUTC} ${hourUTC} * * *`;
  await aggregationQueue.add(
    "daily-reconcile",
    { type: "daily-reconcile" },
    { repeat: { pattern: cron }, jobId: "daily-reconcile" }
  );
}

export async function startAggregationScheduler(): Promise<void> {
  await scheduleRollingAggregation();
  await scheduleDailyReconcile();
  console.log("[subscription] Aggregation scheduler started (rolling 30s + daily reconcile)");
}
