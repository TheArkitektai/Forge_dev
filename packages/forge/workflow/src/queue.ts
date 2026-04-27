import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null });

export const transitionQueue = new Queue("workflow-transitions", { connection: redis });
export const gateQueue = new Queue("workflow-gates", { connection: redis });

export interface TransitionJob {
  storyId: string;
  fromState: string;
  toState: string;
  triggeredBy: string;
  proofHash: string;
}

export interface GateJob {
  gateId: string;
  storyId: string;
  userId: string;
}

export function createTransitionWorker(handler: (job: { data: TransitionJob }) => Promise<void>): Worker {
  return new Worker("workflow-transitions", handler, { connection: redis });
}

export function createGateWorker(handler: (job: { data: GateJob }) => Promise<void>): Worker {
  return new Worker("workflow-gates", handler, { connection: redis });
}
