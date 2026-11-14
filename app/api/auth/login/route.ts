import { NextResponse } from "next/server";
import { clientIp, loginAttempt } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Starts GitHub sign-in. Limited to 10 attempts per IP per 15 minutes. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/admin/login?error=config", url));
  }
  if (!(await loginAttempt(clientIp(req), "start"))) {
    return NextResponse.redirect(new URL("/admin/login?error=rate", url), 303);
  }
  const state = crypto.randomUUID();
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", new URL("/api/auth/callback", url).toString());
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("allow_signup", "false");
  const res = NextResponse.redirect(authorize);
  res.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 600,
  });
  return res;
}
