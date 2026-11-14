import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

/** Renders the body exactly as the public page will (same pipeline). */
export async function POST(req: Request) {
  const g = await guardAdmin(req);
  if ("error" in g) return g.error;
  const body = (await req.json().catch(() => ({}))) as { content_mdx?: unknown };
  const md = typeof body.content_mdx === "string" ? body.content_mdx : "";
  return NextResponse.json(await renderMarkdown(md));
}
