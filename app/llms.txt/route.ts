import { SITE, abs } from "@/lib/site";
import { REPORT_PAGES, reportPage } from "@/lib/report";
import { listPublished } from "@/lib/posts";

// Rendered on every request (SSR) so publishing, edits and removals show at once.
export const dynamic = "force-dynamic";

/** llms.txt: a plain Markdown index of the site for AI tools (low effort by design). */
export async function GET() {
  const posts = await listPublished();
  const lines = [
    `# ${SITE.title}`,
    "",
    `> ${SITE.description}`,
    "",
    `운영: ${SITE.publisher.name}`,
    "",
    "## 보고서",
    "",
    ...REPORT_PAGES.map((p) => `- [${p.title}](${abs(`/report/${p.slug}`)}): ${reportPage(p.slug)!.description}`),
    "",
    "## 칼럼",
    "",
    ...(posts.length
      ? posts.map((p) => `- [${p.title}](${abs(`/blog/${p.slug}`)})${p.summary ? `: ${p.summary}` : ""}`)
      : ["- 아직 발행한 칼럼이 없습니다."]),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
