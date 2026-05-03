import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { errorHandler } from "./middleware/error.js";
import { usageTrackingMiddleware } from "./middleware/usage.js";

import healthRoutes from "./routes/health.js";
import orgRoutes from "./routes/organizations.js";
import projectRoutes from "./routes/projects.js";
import userRoutes from "./routes/users.js";
import storyRoutes from "./routes/stories.js";
import subscriptionRoutes from "./routes/subscription.js";
import billingRoutes from "./routes/billing.js";

export function createApp(): Hono {
  const app = new Hono();

  app.use(logger());
  app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
  app.use(secureHeaders());
  app.use(usageTrackingMiddleware);

  app.onError(errorHandler);

  app.route("/api/v1/health", healthRoutes);
  app.route("/api/v1/organizations", orgRoutes);
  app.route("/api/v1/projects", projectRoutes);
  app.route("/api/v1/users", userRoutes);
  app.route("/api/v1/stories", storyRoutes);
  app.route("/api/v1/subscription", subscriptionRoutes);
  app.route("/api/v1/billing", billingRoutes);

  app.get("/api/v1/openapi.json", (c) => {
    return c.json({
      openapi: "3.1.0",
      info: { title: "Arkitekt Forge API", version: "1.0.0" },
      paths: {},
    });
  });

  return app;
}
