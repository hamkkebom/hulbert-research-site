import type { MetadataRoute } from "next";
import { abs, AUTHORS, SITE } from "@/lib/site";
import { REPORT_PAGES } from "@/lib/report";
import { listPublished } from "@/lib/posts";

// Rendered on every request (SSR) so publishing, edits and removals show at once.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublished();
  const reportDate = new Date(SITE.reportModified + "T00:00:00+09:00");
  const latestPost = posts.reduce<Date | undefined>((acc, p) => {
    const d = new Date(p.updated_at);
    return !acc || d > acc ? d : acc;
  }, undefined);

  return [
    { url: abs("/"), lastModified: reportDate },
    ...REPORT_PAGES.map((p) => ({ url: abs(`/report/${p.slug}`), lastModified: reportDate })),
    { url: abs("/blog"), ...(latestPost ? { lastModified: latestPost } : {}) },
    ...posts.map((p) => ({ url: abs(`/blog/${p.slug}`), lastModified: new Date(p.updated_at) })),
    ...AUTHORS.map((a) => ({ url: abs(`/authors/${a.slug}`) })),
  ];
}
