import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import manifest from "@/content/report/manifest.json";
import hashMap from "@/content/report/hash-map.json";

export type ReportNote = { n: number; html: string; refs: string[] };
export type ReportCitation = { n: number; text: string; url?: string };
export type ReportPage = {
  slug: string;
  titleId: string;
  title: string;
  description: string;
  headings: { level: number; id: string; text: string }[];
  notes: ReportNote[];
  citations: ReportCitation[];
};

/** Report pages in reading order. Content is fixed in code (content/report/*.html). */
export const REPORT_PAGES = (manifest as { pages: ReportPage[] }).pages;

/** Old single-page anchors (#id) → new address, used by the home page redirect script. */
export const HASH_MAP = hashMap as Record<string, string>;

/** Hand-written descriptions where the first paragraph is not a good summary. */
const DESCRIPTIONS: Record<string, string> = {
  "appendix-a": "호머 헐버트의 1863년 출생부터 2026년까지의 행적과 기념 사업을 연도별로 정리한 연보.",
  "appendix-b": "고종, 이승만, 주시경 등 헐버트의 생애와 관련된 인물들의 약전.",
  "appendix-c": "양화진 외국인 선교사 묘역 등 헐버트를 기리는 기념물과 기념 행사 일람.",
  references: "헐버트 연구 보고서가 참고한 1차 사료, 국문·영문 2차 사료, 웹사이트와 언론 보도 목록.",
};

export function reportPage(slug: string) {
  const p = REPORT_PAGES.find((x) => x.slug === slug);
  if (!p) return null;
  return { ...p, description: DESCRIPTIONS[slug] ?? p.description };
}

export function reportHtml(slug: string): string {
  return readFileSync(join(process.cwd(), "content", "report", slug + ".html"), "utf8");
}

export function timelineHtml(): string {
  return readFileSync(join(process.cwd(), "content", "report", "_timeline.html"), "utf8");
}

export function neighbours(slug: string) {
  const i = REPORT_PAGES.findIndex((x) => x.slug === slug);
  return { prev: REPORT_PAGES[i - 1] ?? null, next: REPORT_PAGES[i + 1] ?? null };
}
