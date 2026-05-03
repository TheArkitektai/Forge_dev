export interface ConnectorManifest {
  id: string;
  name: string;
  version: string;
  category: string;
  authType: "oauth" | "apikey" | "basic" | "none";
  actions: ConnectorAction[];
  events: ConnectorEvent[];
}

export interface ConnectorAction {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  rateLimit?: { requests: number; window: string };
}

export interface ConnectorEvent {
  id: string;
  name: string;
  payloadSchema: Record<string, unknown>;
}

export interface ConnectorInstance {
  id: string;
  manifestId: string;
  organizationId: string;
  config: Record<string, unknown>;
  status: "active" | "error" | "paused";
  createdAt: string;
  updatedAt: string;
}

export class ConnectorRegistry {
  private manifests = new Map<string, ConnectorManifest>();
  
  register(manifest: ConnectorManifest): void {
    this.manifests.set(manifest.id, manifest);
  }
  
  get(id: string): ConnectorManifest | undefined {
    return this.manifests.get(id);
  }
  
  list(): ConnectorManifest[] {
    return Array.from(this.manifests.values());
  }
  
  listByCategory(category: string): ConnectorManifest[] {
    return this.list().filter((m) => m.category === category);
  }
}

export const registry = new ConnectorRegistry();

// Reference: GitHub connector
registry.register({
  id: "github",
  name: "GitHub",
  version: "1.0.0",
  category: "dev_tools",
  authType: "oauth",
  actions: [
    { id: "create_pr", name: "Create Pull Request", description: "Create a PR", inputSchema: {}, outputSchema: {} },
    { id: "merge_pr", name: "Merge Pull Request", description: "Merge a PR", inputSchema: {}, outputSchema: {} },
    { id: "list_commits", name: "List Commits", description: "List commits", inputSchema: {}, outputSchema: {} },
    { id: "trigger_workflow", name: "Trigger Workflow", description: "Trigger GitHub Actions", inputSchema: {}, outputSchema: {} },
  ],
  events: [
    { id: "push", name: "Push", payloadSchema: {} },
    { id: "pr_opened", name: "PR Opened", payloadSchema: {} },
    { id: "workflow_completed", name: "Workflow Completed", payloadSchema: {} },
  ],
});

// NEOM: TOS connector
registry.register({
  id: "tos",
  name: "TOS (Saudi Customs)",
  version: "1.0.0",
  category: "enterprise",
  authType: "apikey",
  actions: [
    { id: "submit_declaration", name: "Submit Declaration", description: "Submit customs declaration", inputSchema: {}, outputSchema: {} },
    { id: "query_status", name: "Query Status", description: "Query declaration status", inputSchema: {}, outputSchema: {} },
  ],
  events: [{ id: "status_update", name: "Status Update", payloadSchema: {} }],
});

// NEOM: FASAH connector
registry.register({
  id: "fasah",
  name: "FASAH",
  version: "1.0.0",
  category: "enterprise",
  authType: "apikey",
  actions: [
    { id: "track_shipment", name: "Track Shipment", description: "Track shipment status", inputSchema: {}, outputSchema: {} },
    { id: "clearance_status", name: "Clearance Status", description: "Get clearance status", inputSchema: {}, outputSchema: {} },
  ],
  events: [{ id: "clearance_update", name: "Clearance Update", payloadSchema: {} }],
});
