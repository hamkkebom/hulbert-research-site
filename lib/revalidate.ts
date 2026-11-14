import "server-only";
import { revalidatePath } from "next/cache";
import { authorByName } from "./site";

/**
 * After a post is published, edited, unpublished or deleted: drop the cached
 * post page, its share image, the list, the author page, the sitemap and llms.txt
 * so the next visit is rebuilt with current data.
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
