import "server-only";
import { revalidatePath } from "next/cache";
import { authorByName } from "./site";

/**
 * After a post is published, edited, unpublished or deleted. The post page,
 * list, author page, sitemap and llms.txt are rendered per request already;
 * this drops cached copies (share image, and any CDN copy) as a second line.
 */
export function revalidatePost(post: { slug: string; author_name: string }) {
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath(`/og/blog/${post.slug}`);
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
  const a = authorByName(post.author_name);
  if (a) revalidatePath(`/authors/${a.slug}`);
}
