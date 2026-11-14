import Link from "next/link";
import { REPORT_PAGES, HASH_MAP, timelineHtml } from "@/lib/report";
import { SITE } from "@/lib/site";
import { formatDate } from "@/lib/format";

export const dynamic = "force-static";

// Old links pointed at #anchors on the single-page report. Send them to the
// chapter page that now holds that anchor (runs before the page paints).
const redirectScript = `(function(){try{var m=${JSON.stringify(HASH_MAP).replace(/</g, "\\u003c")};var h=decodeURIComponent(location.hash.slice(1));var t=m[h];if(h&&t&&t!=="/"&&!document.getElementById(h)){location.replace(t);}}catch(e){}})();`;

export default function Home() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      <article>
        <header>
          <h1>호머 베절릴 헐버트(Homer Bezaleel Hulbert) 종합 학술 연구 보고서</h1>
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

        <nav className="toc" id="toc" aria-labelledby="toc-title">
          <h2 id="toc-title">목차</h2>
          <ul>
            {REPORT_PAGES.map((p) => (
              <li key={p.slug}>
                <Link href={`/report/${p.slug}`}>{p.title}</Link>
                {p.headings.some((h) => h.level === 2) && (
                  <ul>
                    {p.headings
                      .filter((h) => h.level === 2)
                      .map((h) => (
                        <li key={h.id}>
                          <Link href={`/report/${p.slug}#${encodeURIComponent(h.id)}`}>{h.text}</Link>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="timeline-title">
          <h2 id="timeline-title" style={{ textAlign: "center", marginTop: "2em" }}>
            헐버트의 생애 — 한국 나이 기준
          </h2>
          <div dangerouslySetInnerHTML={{ __html: timelineHtml() }} />
        </section>
      </article>
    </>
  );
}
