import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/auth";
import { createPost, dbErrorMessage, listAll, parseInput } from "@/lib/posts";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await guardAdmin(req);
  if ("error" in g) return g.error;
  return NextResponse.json({ posts: await listAll() });
}

/** Creates a draft. Publishing is a separate action. */
export async function POST(req: Request) {
  const g = await guardAdmin(req);
  if ("error" in g) return g.error;
  const parsed = parseInput(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  try {
    return NextResponse.json({ post: await createPost(parsed.value) }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ errors: [dbErrorMessage(e)] }, { status: 409 });
  }
}
