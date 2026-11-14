import "server-only";
import { sql } from "./db";
import { AUTHORS } from "./site";

export type Faq = { q: string; a: string };
export type Post = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content_mdx: string;
  category: string;
  tags: string[];
  author_name: string;
  faq_json: Faq[];
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
export type PostListItem = Pick<
  Post,
  "id" | "slug" | "title" | "summary" | "category" | "tags" | "author_name" | "status" | "published_at" | "updated_at"
>;

function iso<T extends Record<string, unknown>>(row: T): T {
  const r = { ...row } as Record<string, unknown>;
  for (const k of ["published_at", "created_at", "updated_at"]) {
    if (r[k] instanceof Date) r[k] = (r[k] as Date).toISOString();
  }
  if (typeof r.id === "string") r.id = Number(r.id);
  return r as T;
}

// ---------- public (published only) ----------

export async function listPublished(): Promise<PostListItem[]> {
  const rows = await sql()`
    SELECT id, slug, title, summary, category, tags, author_name, status, published_at, updated_at
    FROM posts WHERE status = 'published' ORDER BY published_at DESC`;
  return (rows as PostListItem[]).map(iso);
}

export async function getPublished(slug: string): Promise<Post | null> {
  const rows = await sql()`SELECT * FROM posts WHERE slug = ${slug} AND status = 'published' LIMIT 1`;
  return rows[0] ? iso(rows[0] as Post) : null;
}

// ---------- admin ----------

export async function listAll(): Promise<PostListItem[]> {
  const rows = await sql()`
    SELECT id, slug, title, summary, category, tags, author_name, status, published_at, updated_at
    FROM posts ORDER BY updated_at DESC`;
  return (rows as PostListItem[]).map(iso);
}

export async function getById(id: number): Promise<Post | null> {
  const rows = await sql()`SELECT * FROM posts WHERE id = ${id} LIMIT 1`;
  return rows[0] ? iso(rows[0] as Post) : null;
}

export type PostInput = {
  slug: string;
  title: string;
  summary: string;
  content_mdx: string;
  category: string;
  tags: string[];
  author_name: string;
  faq_json: Faq[];
};

const SLUG_RE = /^[a-z0-9가-힣]+(-[a-z0-9가-힣]+)*$/;

/** Validates and normalises an admin form body. Returns errors in Korean. */
export function parseInput(body: unknown): { ok: true; value: PostInput } | { ok: false; errors: string[] } {
  const b = (body ?? {}) as Record<string, unknown>;
  const str = (k: string) => (typeof b[k] === "string" ? (b[k] as string) : "").trim();
  const errors: string[] = [];
  const slug = str("slug").toLowerCase();
  const title = str("title");
  const summary = str("summary");
  const content_mdx = typeof b.content_mdx === "string" ? b.content_mdx : "";
  const category = str("category");
  const author_name = str("author_name");
  const tags = (Array.isArray(b.tags) ? b.tags : String(b.tags ?? "").split(","))
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 20);
  const faqRaw = Array.isArray(b.faq_json) ? b.faq_json : [];
  const faq_json: Faq[] = faqRaw
    .map((f) => ({ q: String((f as Faq)?.q ?? "").trim(), a: String((f as Faq)?.a ?? "").trim() }))
    .filter((f) => f.q || f.a);

  if (!SLUG_RE.test(slug) || slug.length > 120)
    errors.push("주소(slug)는 영문 소문자·숫자·한글과 하이픈(-)만 쓸 수 있습니다. 예: hulbert-hangul");
  if (!title || title.length > 200) errors.push("제목은 1~200자로 적어 주세요.");
  if (summary.length > 500) errors.push("요약은 500자 이내로 적어 주세요.");
  if (!AUTHORS.some((a) => a.name === author_name)) errors.push("작성자를 목록에서 골라 주세요.");
  if (faq_json.some((f) => !f.q || !f.a)) errors.push("FAQ는 질문과 답을 모두 적어 주세요.");
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { slug, title, summary, content_mdx, category, tags, author_name, faq_json } };
}

export async function createPost(v: PostInput): Promise<Post> {
  const rows = await sql()`
    INSERT INTO posts (slug, title, summary, content_mdx, category, tags, author_name, faq_json)
    VALUES (${v.slug}, ${v.title}, ${v.summary}, ${v.content_mdx}, ${v.category}, ${v.tags},
            ${v.author_name}, ${JSON.stringify(v.faq_json)}::jsonb)
    RETURNING *`;
  return iso(rows[0] as Post);
}

export async function updatePost(id: number, v: PostInput): Promise<Post | null> {
  const rows = await sql()`
    UPDATE posts SET slug = ${v.slug}, title = ${v.title}, summary = ${v.summary},
      content_mdx = ${v.content_mdx}, category = ${v.category}, tags = ${v.tags},
      author_name = ${v.author_name}, faq_json = ${JSON.stringify(v.faq_json)}::jsonb
    WHERE id = ${id} RETURNING *`;
  return rows[0] ? iso(rows[0] as Post) : null;
}

export async function setStatus(id: number, status: "draft" | "published"): Promise<Post | null> {
  const rows = await sql()`UPDATE posts SET status = ${status} WHERE id = ${id} RETURNING *`;
  return rows[0] ? iso(rows[0] as Post) : null;
}

export async function deletePost(id: number): Promise<Post | null> {
  const rows = await sql()`DELETE FROM posts WHERE id = ${id} RETURNING *`;
  return rows[0] ? iso(rows[0] as Post) : null;
}

/** Maps Postgres errors to a Korean message for the admin screen. */
export function dbErrorMessage(e: unknown): string {
  const err = e as { code?: string; message?: string };
  if (err.code === "23505") return "같은 주소(slug)를 쓰는 글이 이미 있습니다.";
  if (err.message?.includes("slug cannot change")) return "처음 발행한 뒤에는 주소(slug)를 바꿀 수 없습니다.";
  if (err.code === "23514") return "입력값이 규칙에 맞지 않습니다.";
  return "저장하지 못했습니다.";
}
