import type { Context, Next } from "hono";

export async function errorHandler(err: Error, c: Context) {
  console.error("API Error:", err);
  return c.json(
    {
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    },
    500
  );
}
