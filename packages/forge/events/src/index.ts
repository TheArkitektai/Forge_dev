/* ────────────────────────────────────────────────────────────────
   @forge/events — Redis Streams Event Bus
   ──────────────────────────────────────────────────────────────── */

import { Redis } from "ioredis";
import type { MeteringEventPayload } from "@forge/contracts";

export type EventType =
  | "token_consumed"
  | "budget_alert"
  | "budget_exceeded"
  | "subscription_changed"
  | "agent_execution_started"
  | "agent_execution_completed"
  | "story_transitioned"
  | "gate_evaluated";

export interface EventPayload {
  type: EventType;
  organizationId: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export class EventBus {
  private publisher: Redis;
  private subscriber: Redis;
  private streamKey: string;
  private consumerGroup: string;
  private isConnected = false;

  constructor(redisUrl: string, streamKey = "forge:events", consumerGroup = "forge:consumers") {
    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);
    this.streamKey = streamKey;
    this.consumerGroup = consumerGroup;
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    try {
      await this.publisher.xgroup("CREATE", this.streamKey, this.consumerGroup, "$", "MKSTREAM");
    } catch (err: any) {
      if (!err.message?.includes("already exists")) throw err;
    }
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
    this.isConnected = false;
  }

  async publish(event: EventPayload): Promise<string> {
    const id = await this.publisher.xadd(
      this.streamKey,
      "*",
      "event",
      JSON.stringify(event)
    );
    return id as string;
  }

  async publishMetering(event: MeteringEventPayload): Promise<string> {
    return this.publish({
      type: event.type as EventType,
      organizationId: event.organizationId,
      payload: event.payload,
      timestamp: event.timestamp,
    });
  }

  async consume(
    consumerName: string,
    handler: (event: EventPayload, id: string) => Promise<void> | void,
    options: { count?: number; block?: number } = {}
  ): Promise<void> {
    const count = options.count ?? 10;
    const block = options.block ?? 5000;

    const results = await this.subscriber.xreadgroup(
      "GROUP",
      this.consumerGroup,
      consumerName,
      "COUNT",
      count,
      "BLOCK",
      block,
      "STREAMS",
      this.streamKey,
      ">"
    ) as Array<[string, Array<[string, string[]]>]> | null;

    if (!results || results.length === 0) return;

    for (const [, messages] of results) {
      if (!messages) continue;
      for (const [id, fields] of messages) {
        try {
          const eventData = fields.find((f: string) => f === "event");
          if (!eventData) continue;
          const event: EventPayload = JSON.parse(eventData);
          await handler(event, id as string);
          await this.subscriber.xack(this.streamKey, this.consumerGroup, id as string);
        } catch (err) {
          console.error(`Event processing failed for ${id}:`, err);
        }
      }
    }
  }

  async getStreamInfo(): Promise<{ length: number; groups: number }> {
    const info = await this.publisher.xinfo("STREAM", this.streamKey) as Array<string | number>;
    const entries: Record<string, unknown> = {};
    for (let i = 0; i < info.length; i += 2) {
      entries[String(info[i])] = info[i + 1];
    }
    return {
      length: Number(entries.length) || 0,
      groups: Number(entries.groups) || 0,
    };
  }
}

export { Redis };
