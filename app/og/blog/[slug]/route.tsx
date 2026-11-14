import { ogCard } from "@/lib/og";
import { getPublished } from "@/lib/posts";

// Per request: a draft visited before publishing must not leave a cached 404.
export const dynamic = "force-dynamic";

/** Share image for a published post, at a stable address: /og/blog/<slug> */
export async function GET(_req: Request, ctx: RouteContext<"/og/blog/[slug]">) {
  const { slug } = await ctx.params;
  const post = await getPublished(decodeURIComponent(slug));
  if (!post) return new Response("Not found", { status: 404 });
  return ogCard({ title: post.title, kicker: post.category ? `칼럼 · ${post.category}` : "칼럼" });
}
