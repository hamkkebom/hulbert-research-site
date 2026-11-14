import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession, type Session } from "./session";
import { sql } from "./db";

/** For server components: the current admin session, or null. */
export async function currentAdmin(): Promise<Session | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

/**
 * For admin route handlers. Re-checks the signed cookie on every request and
 * rejects cross-site requests. Returns a response to send back when not allowed.
 */
export async function guardAdmin(req: Request): Promise<{ session: Session } | { error: NextResponse }> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.get("origin");
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    if (origin && host && new URL(origin).host !== host) {
      return { error: NextResponse.json({ error: "cross-site request" }, { status: 403 }) };
    }
  }
  const token = req.headers
    .get("cookie")
    ?.split(/;\s*/)
    .find((c) => c.startsWith(SESSION_COOKIE + "="))
    ?.slice(SESSION_COOKIE.length + 1);
  const session = await verifySession(token);
  if (!session) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  return { session };
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 10;

/** Records a login attempt and says whether this IP is over the limit. */
export async function loginAttempt(ip: string, kind: "start" | "failure"): Promise<boolean> {
  const db = sql();
  const rows = (await db`
    SELECT count(*)::int AS n FROM auth_attempts
    WHERE ip = ${ip} AND created_at > now() - make_interval(mins => ${WINDOW_MINUTES})
  `) as { n: number }[];
  if (rows[0].n >= MAX_ATTEMPTS) return false;
  await db`INSERT INTO auth_attempts (ip, kind) VALUES (${ip}, ${kind})`;
  // keep the table small
  await db`DELETE FROM auth_attempts WHERE created_at < now() - interval '1 day'`;
  return true;
}
