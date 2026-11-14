import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { REPORT_PAGES, reportPage, reportHtml, neighbours } from "@/lib/report";
import { SITE, abs } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbs, publisherRef } from "@/lib/schema";
import { PageToc } from "@/components/PageToc";

export const dynamicParams = false;

export function generateStaticParams() {
  return REPORT_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/report/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = reportPage(slug);
  if (!p) return {};
  const path = `/report/${slug}`;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: p.title,
      description: p.description,
      url: path,
      siteName: SITE.name,
      locale: SITE.locale,
      publishedTime: SITE.reportPublished,
      modifiedTime: SITE.reportModified,
    },
    twitter: { card: "summary_large_image", title: p.title, description: p.description },
  };
}

export default async function ReportChapter({ params }: PageProps<"/report/[slug]">) {
  const { slug } = await params;
  const p = reportPage(slug);
  if (!p) notFound();
  const path = `/report/${slug}`;
  const { prev, next } = neighbours(slug);

  const article = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: p.title,
    description: p.description,
    inLanguage: "ko",
    datePublished: SITE.reportPublished,
    dateModified: SITE.reportModified,
    author: publisherRef,
    publisher: publisherRef,
    mainEntityOfPage: abs(path),
    url: abs(path),
    isPartOf: { "@type": "CreativeWork", name: SITE.title, url: abs("/") },
    citation: p.citations.map((c) => ({
      "@type": "CreativeWork",
      name: c.text,
      ...(c.url ? { url: c.url } : {}),
    })),
  };

  return (
    <>
      <nav className="breadcrumb" aria-label="현재 위치">
        <ol>
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>
            <Link href="/#toc">보고서</Link>
          </li>
          <li aria-current="page">{p.title}</li>
        </ol>
      </nav>
      <article>
        <header>
          <h1 id={p.titleId}>{p.title}</h1>
          <p className="meta">
            <span>
              처음 게시 <time dateTime={SITE.reportPublished}>{formatDate(SITE.reportPublished)}</time>
            </span>
            <span>
              마지막 수정 <time dateTime={SITE.reportModified}>{formatDate(SITE.reportModified)}</time>
            </span>
            <span>발행 {SITE.publisher.name}</span>
          </p>
        </header>

        <PageToc headings={p.headings} />

        <section className="report-body" dangerouslySetInnerHTML={{ __html: reportHtml(slug) }} />

        {p.notes.length > 0 && (
          <section className="footnotes" aria-labelledby="각주">
            <h2 id="각주">각주</h2>
            <ol>
              {p.notes.map((n) => (
                <li key={n.n} id={`fn-${n.n}`} value={n.n}>
                  <span dangerouslySetInnerHTML={{ __html: n.html }} />{" "}
                  {n.refs.map((r, i) => (
                    <a key={r} href={`#${r}`} className="fn-back" aria-label={`본문 ${n.n}번 각주 위치로 돌아가기`}>
                      ↩{n.refs.length > 1 ? String.fromCharCode(97 + i) : ""}
                    </a>
                  ))}
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>

      <nav className="pager" aria-label="이전·다음 장">
        {prev && (
          <Link href={`/report/${prev.slug}`} rel="prev">
            ← {prev.title}
          </Link>
        )}
        {next && (
          <Link href={`/report/${next.slug}`} rel="next" className="next">
            {next.title} →
          </Link>
        )}
      </nav>

      <JsonLd data={article} />
      <JsonLd
        data={breadcrumbs([
          { name: "홈", path: "/" },
          { name: "보고서", path: "/#toc" },
          { name: p.title, path },
        ])}
      />
    </>
  );
}
