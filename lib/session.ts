/**
 * Signed admin session cookie (HMAC-SHA256 with SESSION_SECRET).
 * Uses Web Crypto so it works in route handlers and in proxy.ts.
 */
export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Session = { login: string; exp: number };

const enc = new TextEncoder();

function b64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars)");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function signSession(login: string): Promise<string> {
  const payload: Session = { login, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await key(), enc.encode(body)));
  return body + "." + b64url(sig);
}

export function allowedLogins(): string[] {
  return (process.env.ADMIN_GITHUB_LOGINS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Returns the session if the cookie is authentic, unexpired and the login is still allowed. */
export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(), fromB64url(sig), enc.encode(body));
    if (!ok) return null;
    const s = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Session;
    if (typeof s.login !== "string" || typeof s.exp !== "number") return null;
    if (s.exp < Math.floor(Date.now() / 1000)) return null;
    if (!allowedLogins().includes(s.login.toLowerCase())) return null;
    return s;
  } catch {
    return null;
  }
}
