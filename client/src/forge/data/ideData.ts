import type { IDEConnection } from "@/forge/types";

export const ideConnections: IDEConnection[] = [
  {
    id: "ide-001",
    provider: "vscode",
    status: "connected",
    lastSync: "2024-03-20T09:12:00Z",
    activeFile: "src/auth/CitizenAuthController.ts",
    activeBranch: "feature/citizen-auth-module",
    capabilities: ["context_injection", "gate_approval", "inline_governance", "memory_sidebar"],
    userId: "user-001",
  },
  {
    id: "ide-002",
    provider: "jetbrains",
    status: "disconnected",
    lastSync: "2024-03-19T16:45:00Z",
    activeFile: undefined,
    activeBranch: undefined,
    capabilities: ["context_injection", "memory_sidebar"],
    userId: "user-002",
  },
  {
    id: "ide-003",
    provider: "cursor",
    status: "syncing",
    lastSync: "2024-03-20T09:10:00Z",
    activeFile: "src/permits/PermitEngine.ts",
    activeBranch: "main",
    capabilities: ["context_injection", "inline_governance"],
    userId: "user-003",
  },
];
