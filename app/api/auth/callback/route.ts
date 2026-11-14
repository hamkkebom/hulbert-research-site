import { NextResponse } from "next/server";
import { clientIp, loginAttempt } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_MAX_AGE, allowedLogins, signSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function fail(url: URL, code: string) {
  const res = NextResponse.redirect(new URL(`/admin/login?error=${code}`, url), 303);
  res.cookies.delete({ name: "oauth_state", path: "/api/auth" });
  return res;
}

/** GitHub redirects here. Only logins listed in ADMIN_GITHUB_LOGINS get a session. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.headers
    .get("cookie")
    ?.split(/;\s*/)
    .find((c) => c.startsWith("oauth_state="))
    ?.slice("oauth_state=".length);
  const ip = clientIp(req);

  if (!code || !state || !cookieState || state !== cookieState) {
    await loginAttempt(ip, "failure");
    return fail(url, "state");
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: new URL("/api/auth/callback", url).toString(),
    }),
  });
  const token = ((await tokenRes.json().catch(() => ({}))) as { access_token?: string }).access_token;
  if (!token) {
    await loginAttempt(ip, "failure");
    return fail(url, "github");
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "hulbert-research-site" },
  });
  const login = ((await userRes.json().catch(() => ({}))) as { login?: string }).login;
  if (!login || !allowedLogins().includes(login.toLowerCase())) {
    await loginAttempt(ip, "failure");
    return fail(url, "denied");
  }

  const res = NextResponse.redirect(new URL("/admin", url), 303);
  res.cookies.delete({ name: "oauth_state", path: "/api/auth" });
  res.cookies.set(SESSION_COOKIE, await signSession(login), {
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
