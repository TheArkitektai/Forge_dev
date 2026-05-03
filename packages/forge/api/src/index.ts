import { startAggregationScheduler } from "@forge/subscription";
import { createApp } from "./server.js";

const app = createApp();
const port = parseInt(process.env.PORT || "4000", 10);

export default app;

// Node.js compatible server startup
import { createServer } from "node:http";

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }
  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
  });
  const response = await app.fetch(request, { incoming: req, outgoing: res });
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
});

server.listen(port, async () => {
  console.log(`Forge API server running on http://localhost:${port}`);
  try {
    await startAggregationScheduler();
  } catch (err) {
    console.error("Failed to start aggregation scheduler:", err);
  }
});
