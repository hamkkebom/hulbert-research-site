import type { Metadata } from "next";
import Link from "next/link";
import { listPublished } from "@/lib/posts";
import { authorByName } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbs } from "@/lib/schema";

// ISR: rebuilt at most hourly, and immediately when a post is published or edited.
export const revalidate = 3600;

const DESCRIPTION = "호머 헐버트 박사와 그의 시대를 다루는 칼럼 모음.";

export const metadata: Metadata = {
  title: "칼럼",
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: { title: "칼럼", description: DESCRIPTION, url: "/blog", type: "website" },
};

export default async function BlogIndex() {
  const posts = await listPublished();
  return (
    <>
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li aria-current="page">칼럼</li>
        </ol>
      </nav>
      <header>
        <h1>칼럼</h1>
        <p>{DESCRIPTION}</p>
      </header>
      {posts.length === 0 ? (
        <p>아직 발행한 칼럼이 없습니다.</p>
      ) : (
        <ul className="post-list">
          {posts.map((p) => {
            const author = authorByName(p.author_name);
            return (
              <li key={p.id}>
                <article>
                  {p.category && <p className="meta" style={{ margin: 0 }}>{p.category}</p>}
                  <h2>
                    <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                  </h2>
                  {p.summary && <p>{p.summary}</p>}
                  <p className="meta">
                    <span>
                      {author ? <Link href={`/authors/${author.slug}`}>{p.author_name}</Link> : p.author_name}
                    </span>
                    <span>
                      처음 발행 <time dateTime={p.published_at!}>{formatDate(p.published_at!)}</time>
                    </span>
                    <span>
                      마지막 수정 <time dateTime={p.updated_at}>{formatDate(p.updated_at)}</time>
                    </span>
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      )}
      <JsonLd
        data={breadcrumbs([
          { name: "홈", path: "/" },
          { name: "칼럼", path: "/blog" },
        ])}
      />
    </>
  );
}
