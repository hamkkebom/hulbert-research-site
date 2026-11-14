"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Post, Faq } from "@/lib/posts";

type Form = {
  slug: string;
  title: string;
  summary: string;
  content_mdx: string;
  category: string;
  tags: string;
  author_name: string;
  faq_json: Faq[];
};

const input = "w-full rounded border border-[var(--tbl-border)] bg-transparent px-3 py-2 font-[inherit] text-[15px]";
const btn = "cursor-pointer rounded border px-4 py-2 text-[15px] disabled:cursor-not-allowed disabled:opacity-50";

function toForm(p: Post | null, authors: string[]): Form {
  return {
    slug: p?.slug ?? "",
    title: p?.title ?? "",
    summary: p?.summary ?? "",
    content_mdx: p?.content_mdx ?? "",
    category: p?.category ?? "",
    tags: (p?.tags ?? []).join(", "),
    author_name: p?.author_name ?? authors[0] ?? "",
    faq_json: p?.faq_json ?? [],
  };
}

export function Editor({ initial, authors }: { initial: Post | null; authors: string[] }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(initial);
  const [form, setForm] = useState<Form>(() => toForm(initial, authors));
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<{ kind: "ok" | "error"; text: string }[]>([]);
  const [preview, setPreview] = useState<{ html: string; warnings: string[] } | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const payload = () => ({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) });

  async function call(url: string, method: string, body?: unknown) {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      router.push("/admin/login");
      throw new Error("로그인이 필요합니다.");
    }
    if (!res.ok) throw new Error((data.errors ?? [data.error ?? "요청이 실패했습니다."]).join(" "));
    return data;
  }

  /** Saves the form. Returns the saved post. */
  async function save(): Promise<Post> {
    if (post) {
      const { post: saved } = await call(`/api/admin/posts/${post.id}`, "PUT", payload());
      return saved;
    }
    const { post: created } = await call("/api/admin/posts", "POST", payload());
    return created;
  }

  async function run(label: string, fn: () => Promise<Post | null>) {
    setBusy(true);
    setMessages([]);
    try {
      const p = await fn();
      if (p) {
        setPost(p);
        if (!post) router.replace(`/admin/posts/${p.id}`);
      }
      setMessages([{ kind: "ok", text: label }]);
      router.refresh();
    } catch (e) {
      setMessages([{ kind: "error", text: (e as Error).message }]);
    } finally {
      setBusy(false);
    }
  }

  const onSave = () => run(post?.status === "published" ? "저장했습니다. 공개 화면에 바로 반영됩니다." : "임시저장했습니다.", save);
  const onPublish = () =>
    run("발행했습니다.", async () => {
      const saved = await save();
      const { post: p } = await call(`/api/admin/posts/${saved.id}/publish`, "POST");
      return p;
    });
  const onUnpublish = () =>
    run("발행을 취소했습니다. 공개 화면과 사이트맵에서 빠졌습니다.", async () => {
      const { post: p } = await call(`/api/admin/posts/${post!.id}/unpublish`, "POST");
      return p;
    });
  async function onDelete() {
    if (!post || !confirm(`「${post.title}」을(를) 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setBusy(true);
    try {
      await call(`/api/admin/posts/${post.id}`, "DELETE");
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setMessages([{ kind: "error", text: (e as Error).message }]);
      setBusy(false);
    }
  }
  async function onPreview() {
    if (preview) return setPreview(null);
    try {
      const data = await call("/api/admin/preview", "POST", { content_mdx: form.content_mdx });
      setPreview({ html: data.html, warnings: data.warnings });
    } catch (e) {
      setMessages([{ kind: "error", text: (e as Error).message }]);
    }
  }

  const published = post?.status === "published";
  const slugLocked = Boolean(post?.published_at);

  return (
    <main>
      <p className="text-sm">
        <Link href="/admin">← 칼럼 목록</Link>
      </p>
      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="!m-0 text-2xl">{post ? "칼럼 고치기" : "새 칼럼"}</h1>
        {post && (
          <span className="text-sm">
            {published ? (
              <>
                발행됨 · <a href={`/blog/${post.slug}`} target="_blank" rel="noopener">공개 화면 보기</a>
              </>
            ) : (
              "임시저장 (공개되지 않음)"
            )}
          </span>
        )}
      </div>

      {messages.map((m, i) => (
        <p
          key={i}
          role={m.kind === "error" ? "alert" : "status"}
          className={`mt-3 rounded border p-3 ${m.kind === "error" ? "border-red-400 text-red-700 dark:text-red-300" : "border-green-600"}`}
        >
          {m.text}
        </p>
      ))}

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <label className="grid gap-1">
            <span className="font-bold">제목</span>
            <input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} required maxLength={200} />
          </label>
          <label className="grid gap-1">
            <span className="font-bold">주소(slug)</span>
            <input
              className={input}
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="hulbert-hangul"
              disabled={slugLocked}
              aria-describedby="slug-help"
            />
            <span id="slug-help" className="text-sm opacity-75">
              /blog/{form.slug || "…"} — 영문 소문자·숫자·한글과 하이픈(-). {slugLocked && "처음 발행한 뒤에는 바꿀 수 없습니다."}
            </span>
          </label>
          <label className="grid gap-1">
            <span className="font-bold">요약 (검색 결과와 공유 미리보기에 쓰입니다)</span>
            <textarea className={input} rows={3} value={form.summary} onChange={(e) => set("summary", e.target.value)} maxLength={500} />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-1">
              <span className="font-bold">분류</span>
              <input className={input} value={form.category} onChange={(e) => set("category", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="font-bold">태그 (쉼표로 구분)</span>
              <input className={input} value={form.tags} onChange={(e) => set("tags", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="font-bold">작성자</span>
              <select className={input} value={form.author_name} onChange={(e) => set("author_name", e.target.value)}>
                {authors.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="font-bold">
                본문 (마크다운)
              </label>
              <button type="button" className={btn} onClick={onPreview}>
                {preview ? "편집으로 돌아가기" : "미리보기"}
              </button>
            </div>
            {preview ? (
              <div className="rounded border border-[var(--tbl-border)] p-4">
                {preview.warnings.length > 0 && (
                  <ul className="mb-3 text-sm text-amber-700 dark:text-amber-300">
                    {preview.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                )}
                <div className="post-body" dangerouslySetInnerHTML={{ __html: preview.html }} />
              </div>
            ) : (
              <textarea
                id="content"
                className={`${input} font-mono`}
                rows={24}
                value={form.content_mdx}
                onChange={(e) => set("content_mdx", e.target.value)}
              />
            )}
            <span className="text-sm opacity-75">
              소제목은 ## (h2), ### (h3). 이미지: ![대체 글](주소 &quot;가로x세로&quot;). HTML과 JSX는 실행되지 않습니다.
            </span>
          </div>

          <fieldset className="grid gap-3 rounded border border-[var(--tbl-border)] p-4">
            <legend className="px-1 font-bold">자주 묻는 질문 (FAQ)</legend>
            {form.faq_json.length === 0 && <p className="!m-0 text-sm opacity-75">항목이 없습니다.</p>}
            {form.faq_json.map((f, i) => (
              <div key={i} className="grid gap-2 border-b border-[var(--tbl-border)] pb-3">
                <input
                  className={input}
                  placeholder="질문"
                  aria-label={`질문 ${i + 1}`}
                  value={f.q}
                  onChange={(e) => set("faq_json", form.faq_json.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))}
                />
                <textarea
                  className={input}
                  rows={2}
                  placeholder="답"
                  aria-label={`답 ${i + 1}`}
                  value={f.a}
                  onChange={(e) => set("faq_json", form.faq_json.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))}
                />
                <button
                  type="button"
                  className={`${btn} justify-self-start text-sm`}
                  onClick={() => set("faq_json", form.faq_json.filter((_, j) => j !== i))}
                >
                  이 항목 삭제
                </button>
              </div>
            ))}
            <button
              type="button"
              className={`${btn} justify-self-start`}
              onClick={() => set("faq_json", [...form.faq_json, { q: "", a: "" }])}
            >
              FAQ 항목 추가
            </button>
          </fieldset>

          <div className="flex flex-wrap gap-3">
            <button type="button" className={btn} disabled={busy} onClick={onSave}>
              {published ? "저장 (발행 상태 유지)" : "임시저장"}
            </button>
            {!published && (
              <button type="button" className={`${btn} bg-[#8b6914] font-bold text-white`} disabled={busy} onClick={onPublish}>
                발행
              </button>
            )}
            {published && (
              <button type="button" className={btn} disabled={busy} onClick={onUnpublish}>
                발행 취소
              </button>
            )}
            {post && (
              <button type="button" className={`${btn} border-red-500 text-red-600`} disabled={busy} onClick={onDelete}>
                삭제
              </button>
            )}
          </div>
        </form>

        <aside className="self-start rounded border border-[var(--tbl-border)] bg-[var(--bq-bg)] p-4 text-[15px] lg:sticky lg:top-4">
          <h2 className="!mt-0 !border-0 !pb-0 text-lg">칼럼을 쓸 때의 규칙</h2>
          <p className="text-sm">AI 검색에 인용되는 데는 마크업보다 글의 내용이 더 크게 작용합니다.</p>
          <ol className="grid gap-2 pl-5">
            <li>첫 문단에서 질문의 답을 먼저 말합니다.</li>
            <li>수치, 연도, 이름 같은 확인할 수 있는 사실을 적고 출처를 밝힙니다.</li>
            <li>소제목(##, ###)은 그 아래 내용을 그대로 말해 주는 문장으로 씁니다.</li>
            <li>내용이 바뀌면 글을 고칩니다. 고친 날은 글에 자동으로 표시됩니다.</li>
          </ol>
          <h3 className="text-base">이 사이트의 기준</h3>
          <ul className="grid gap-1 pl-5 text-sm">
            <li>(사)헐버트박사기념사업회와 김동진 회장의 자료를 사실의 기준으로 삼습니다.</li>
            <li>출처를 확인하지 못한 인용문과 서술은 싣지 않습니다.</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
