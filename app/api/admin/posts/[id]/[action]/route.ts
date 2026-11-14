import { NextResponse } from "next/server";
import { guardAdmin } from "@/lib/auth";
import { getById, setStatus } from "@/lib/posts";
import { revalidatePost } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/** POST /api/admin/posts/:id/publish  or  /unpublish */
export async function POST(req: Request, ctx: RouteContext<"/api/admin/posts/[id]/[action]">) {
  const g = await guardAdmin(req);
  if ("error" in g) return g.error;
  const { id: raw, action } = await ctx.params;
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || (action !== "publish" && action !== "unpublish")) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const before = await getById(id);
  if (!before) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (action === "publish" && !before.content_mdx.trim()) {
    return NextResponse.json({ errors: ["본문이 비어 있어 발행할 수 없습니다."] }, { status: 400 });
  }
  const post = await setStatus(id, action === "publish" ? "published" : "draft");
  if (post) revalidatePost(post);
  return NextResponse.json({ post });
}
