import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/auth";
import { dbErrorMessage, deletePost, getById, parseInput, updatePost } from "@/lib/posts";
import { revalidatePost } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

function idOf(raw: string) {
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function GET(req: Request, ctx: RouteContext<"/api/admin/posts/[id]">) {
  const g = await guardAdmin(req);
  if ("error" in g) return g.error;
  const id = idOf((await ctx.params).id);
  const post = id ? await getById(id) : null;
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ post });
}

/** Saves edits. A published post stays published and its pages are refreshed. */
export async function PUT(req: Request, ctx: RouteContext<"/api/admin/posts/[id]">) {
  const g = await guardAdmin(req);
  if ("error" in g) return g.error;
  const id = idOf((await ctx.params).id);
  if (!id) return NextResponse.json({ error: "not found" }, { status: 404 });
  const parsed = parseInput(await req.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ errors: parsed.errors }, { status: 400 });
  const before = await getById(id);
  if (!before) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    const post = await updatePost(id, parsed.value);
    if (post && post.status === "published") {
      revalidatePost(post);
      if (before.author_name !== post.author_name) revalidatePost(before);
    }
    return NextResponse.json({ post });
  } catch (e) {
    return NextResponse.json({ errors: [dbErrorMessage(e)] }, { status: 409 });
  }
}

export async function DELETE(req: Request, ctx: RouteContext<"/api/admin/posts/[id]">) {
  const g = await guardAdmin(req);
  if ("error" in g) return g.error;
  const id = idOf((await ctx.params).id);
  const post = id ? await deletePost(id) : null;
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (post.published_at) revalidatePost(post);
  return NextResponse.json({ deleted: post.id });
}
