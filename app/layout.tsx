import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { organization, website } from "@/lib/schema";

const verification: Metadata["verification"] = {};
if (process.env.GOOGLE_SITE_VERIFICATION) verification.google = process.env.GOOGLE_SITE_VERIFICATION;
if (process.env.NAVER_SITE_VERIFICATION)
  verification.other = { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: SITE.title,
    description: SITE.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description },
  alternates: { canonical: "/" },
  verification,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf6" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <JsonLd data={organization()} />
        <JsonLd data={website()} />
      </body>
    </html>
  );
}
