import { createMiddleware } from "hono/factory";
import type { PermissionKey } from "@forge/contracts";
import type { Variables } from "./auth.js";

const ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  platform_admin: ["org:read", "org:write", "project:create", "project:read", "project:write", "project:delete", "story:create", "story:read", "story:write", "story:delete", "subscription:read", "subscription:write", "budget:read", "budget:write", "agent:execute", "agent:configure", "admin:tiers", "admin:tenants", "admin:overrides"],
  tenant_admin: ["org:read", "org:write", "project:create", "project:read", "project:write", "project:delete", "story:create", "story:read", "story:write", "story:delete", "subscription:read", "budget:read", "budget:write", "agent:execute", "agent:configure"],
  project_lead: ["org:read", "project:read", "project:write", "story:create", "story:read", "story:write", "story:delete", "subscription:read", "budget:read", "agent:execute"],
  developer: ["org:read", "project:read", "story:create", "story:read", "story:write", "agent:execute"],
  viewer: ["org:read", "project:read", "story:read"],
};

export function requirePermission(...permissions: PermissionKey[]) {
  return createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const user = c.get("user");
    const userPerms = ROLE_PERMISSIONS[user.role] || [];
    const hasAll = permissions.every((p) => userPerms.includes(p));
    if (!hasAll) {
      return c.json({ code: "FORBIDDEN", message: "Insufficient permissions" }, 403);
    }
    return await next();
  });
}

export function requireRole(...roles: string[]) {
  return createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const user = c.get("user");
    if (!roles.includes(user.role)) {
      return c.json({ code: "FORBIDDEN", message: "Role not authorized" }, 403);
    }
    return await next();
  });
}
