import { notFound } from "next/navigation";
import { ogCard, OG_SIZE } from "@/lib/og";
import { REPORT_PAGES, reportPage } from "@/lib/report";

export const alt = "헐버트 연구 보고서";
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams() {
  return REPORT_PAGES.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = reportPage(slug);
  if (!p) notFound();
  return ogCard({ title: p.title, kicker: "호머 헐버트 종합 학술 연구 보고서" });
}
