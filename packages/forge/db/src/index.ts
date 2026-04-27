/* @forge/db — Database client and utilities */
import postgres from "postgres";

export const DB_VERSION = "1.0.0";

export type Sql = ReturnType<typeof postgres>;

export function createClient(connectionString?: string): Sql {
  const url = connectionString || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required");
  }
  return postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    transform: {
      undefined: null,
    },
  });
}

export const sql = createClient();
