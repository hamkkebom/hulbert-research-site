import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import GithubSlugger from "github-slugger";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { Root, Element } from "hast";

export type Heading = { level: 2 | 3; id: string; text: string };
export type Rendered = { html: string; headings: Heading[]; warnings: string[] };

/**
 * Column bodies are Markdown (the MDX-compatible subset). Raw HTML and JSX are
 * not executed: remark-rehype drops raw HTML, so an admin cannot inject script.
 * Image size: ![대체 글](주소 "800x450").
 */
function rehypeSeo(out: { headings: Heading[]; warnings: string[] }) {
  return () => (tree: Root) => {
    const slugger = new GithubSlugger();
    let imageIndex = 0;
    visit(tree, "element", (node: Element) => {
      // only one h1 per page (the post title): demote body h1 to h2
      if (node.tagName === "h1") node.tagName = "h2";
      if (node.tagName === "h2" || node.tagName === "h3" || node.tagName === "h4") {
        const text = toString(node).trim();
        const id = slugger.slug(text || "section");
        node.properties = { ...node.properties, id };
        if (node.tagName !== "h4") out.headings.push({ level: node.tagName === "h2" ? 2 : 3, id, text });
      }
      if (node.tagName === "img") {
        const p = node.properties || {};
        const alt = String(p.alt ?? "").trim();
        if (!alt) out.warnings.push(`이미지 ${imageIndex + 1}에 대체 글이 없습니다.`);
        const m = /^(\d{2,5})x(\d{2,5})$/.exec(String(p.title ?? "").trim());
        if (m) {
          p.width = Number(m[1]);
          p.height = Number(m[2]);
          delete p.title;
        } else {
          out.warnings.push(`이미지 ${imageIndex + 1}에 크기가 없습니다. ![대체 글](주소 "가로x세로") 형식으로 적어 주세요.`);
        }
        p.loading = imageIndex === 0 ? "eager" : "lazy";
        p.decoding = "async";
        node.properties = p;
        imageIndex++;
      }
      if (node.tagName === "a") {
        const href = String(node.properties?.href ?? "");
        if (/^https?:\/\//.test(href)) node.properties = { ...node.properties, rel: ["noopener"], target: "_blank" };
      }
    });
  };
}

export async function renderMarkdown(md: string): Promise<Rendered> {
  const out = { headings: [] as Heading[], warnings: [] as string[] };
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSeo(out))
    .use(rehypeStringify)
    .process(md);
  return { html: String(file), headings: out.headings, warnings: out.warnings };
}
