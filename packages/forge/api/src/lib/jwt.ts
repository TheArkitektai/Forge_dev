import { SignJWT, jwtVerify } from "jose";
import type { RoleKey, UUID } from "@forge/contracts";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "forge-dev-secret-change-in-production"
);

export interface TokenPayload {
  sub: UUID; // userId
  org: UUID; // organizationId
  role: RoleKey;
  email: string;
  iat: number;
  exp: number;
}

export async function signToken(
  payload: Omit<TokenPayload, "iat" | "exp">,
  expiresIn: string = "24h"
): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, SECRET, {
    clockTolerance: 60,
  });
  return payload as unknown as TokenPayload;
}
