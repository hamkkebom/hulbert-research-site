import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getPublished } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";
import { SITE, abs, authorByName } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { PageToc } from "@/components/PageToc";
import { breadcrumbs, publisherRef } from "@/lib/schema";

// Rendered on every request (SSR) so publishing, edits and removals show at once.
export const dynamic = "force-dynamic";

const load = cache(async (slug: string) => getPublished(decodeURIComponent(slug)));

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await load(slug);
  if (!post) return {};
  const path = `/blog/${post.slug}`;
  const description = post.summary || post.title;
  return {
    title: post.title,
    description,
    alternates: { canonical: path },
    authors: [{ name: post.author_name }],
    keywords: post.tags,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: path,
      siteName: SITE.name,
      locale: SITE.locale,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: [post.author_name],
      section: post.category || undefined,
      tags: post.tags,
      images: [{ url: `/og/blog/${encodeURIComponent(post.slug)}`, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [`/og/blog/${encodeURIComponent(post.slug)}`],
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await load(slug);
  if (!post) notFound();

  const path = `/blog/${post.slug}`;
  const { html, headings } = await renderMarkdown(post.content_mdx);
  const author = authorByName(post.author_name);
  const ogPath = `/og/blog/${encodeURIComponent(post.slug)}`;
  const ogImage = abs(ogPath);
  const description = post.summary || post.title;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      "@type": author?.slug === "hamkkebom" ? "Organization" : "Person",
      name: post.author_name,
      ...(author ? { url: abs(`/authors/${author.slug}`) } : {}),
    },
    publisher: publisherRef,
    mainEntityOfPage: { "@type": "WebPage", "@id": abs(path) },
    image: [ogImage],
    inLanguage: "ko",
    ...(post.category ? { articleSection: post.category } : {}),
    ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
  };

  const faq = post.faq_json.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq_json.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>
            <Link href="/blog">칼럼</Link>
          </li>
          <li aria-current="page">{post.title}</li>
        </ol>
      </nav>
      <article>
        <header>
          {post.category && <p className="meta" style={{ margin: "1.5em 0 0" }}>{post.category}</p>}
          <h1 style={{ marginTop: post.category ? ".2em" : undefined }}>{post.title}</h1>
          {post.summary && <p>{post.summary}</p>}
          <p className="meta">
            <span>
              글쓴이 {author ? <Link href={`/authors/${author.slug}`}>{post.author_name}</Link> : post.author_name}
            </span>
            <span>
              처음 발행 <time dateTime={post.published_at!}>{formatDate(post.published_at!)}</time>
            </span>
            <span>
              마지막 수정 <time dateTime={post.updated_at}>{formatDate(post.updated_at)}</time>
            </span>
          </p>
        </header>

        <figure className="cover">
          {/* eslint-disable-next-line @next/next/no-img-element -- generated share image, fixed size */}
          <img src={ogPath} alt={post.title} width={1200} height={630} />
        </figure>

        <PageToc headings={headings} />

        <section className="post-body" dangerouslySetInnerHTML={{ __html: html }} />

        {post.faq_json.length > 0 && (
          <section className="faq" aria-labelledby="faq-title">
            <h2 id="faq-title">자주 묻는 질문</h2>
            <dl>
              {post.faq_json.map((f, i) => (
                <div key={i}>
                  <dt>{f.q}</dt>
                  <dd>{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {post.tags.length > 0 && (
          <footer>
            <ul className="tags" aria-label="태그">
              {post.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </footer>
        )}
      </article>

      <JsonLd data={article} />
      <JsonLd
        data={breadcrumbs([
          { name: "홈", path: "/" },
          { name: "칼럼", path: "/blog" },
          { name: post.title, path },
        ])}
      />
      {faq && <JsonLd data={faq} />}
    </>
  );
}
