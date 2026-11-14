import Link from "next/link";
import Image from "next/image";
import { SITE, AUTHORS } from "@/lib/site";
import { BackToTop } from "@/components/BackToTop";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <a className="skip-link" href="#main">
        본문으로 건너뛰기
      </a>
      <header className="site-header">
        <Link href="/" className="brand">
          {SITE.name}
        </Link>
        <nav aria-label="주 메뉴">
          <ul>
            <li>
              <Link href="/#toc">보고서 목차</Link>
            </li>
            <li>
              <Link href="/blog">칼럼</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <p>
          <Image src={SITE.publisher.logo} alt="" width={20} height={20} />
          운영: <Link href={`/authors/${AUTHORS[0].slug}`}>{SITE.publisher.name}</Link>
        </p>
        <p>
          © {SITE.copyrightYear} {SITE.publisher.name}. 인용한 자료의 저작권은 각 원저작자에게 있습니다.
        </p>
      </footer>
      <BackToTop />
    </div>
  );
}
