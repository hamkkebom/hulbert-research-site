import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AUTHORS, abs } from "@/lib/site";
import { listPublished } from "@/lib/posts";
import { formatDate } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbs, ORG_ID } from "@/lib/schema";

export const revalidate = 3600;
export const dynamicParams = false;
export function generateStaticParams() {
  return AUTHORS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/authors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = AUTHORS.find((x) => x.slug === slug);
  if (!a) return {};
  return {
    title: `${a.name} 소개`,
    description: a.bio,
    alternates: { canonical: `/authors/${a.slug}` },
    openGraph: { type: "profile", title: `${a.name} 소개`, description: a.bio, url: `/authors/${a.slug}` },
  };
}

export default async function AuthorPage({ params }: PageProps<"/authors/[slug]">) {
  const { slug } = await params;
  const a = AUTHORS.find((x) => x.slug === slug);
  if (!a) notFound();
  const posts = (await listPublished()).filter((p) => p.author_name === a.name);
  const path = `/authors/${a.slug}`;
  return (
    <>
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li aria-current="page">{a.name} 소개</li>
        </ol>
      </nav>
      <article>
        <header>
          <h1>{a.name}</h1>
        </header>
        <p>{a.bio}</p>
        <section aria-labelledby="author-posts">
          <h2 id="author-posts">쓴 칼럼</h2>
          {posts.length === 0 ? (
            <p>아직 발행한 칼럼이 없습니다.</p>
          ) : (
            <ul>
              {posts.map((p) => (
                <li key={p.id}>
                  <Link href={`/blog/${p.slug}`}>{p.title}</Link>{" "}
                  <span className="meta">
                    (<time dateTime={p.published_at!}>{formatDate(p.published_at!)}</time>)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: abs(path),
          mainEntity:
            a.slug === "hamkkebom"
              ? { "@type": "Organization", "@id": ORG_ID, name: a.name, description: a.bio }
              : { "@type": "Person", name: a.name, description: a.bio },
        }}
      />
      <JsonLd
        data={breadcrumbs([
          { name: "홈", path: "/" },
          { name: `${a.name} 소개`, path },
        ])}
      />
    </>
  );
}
