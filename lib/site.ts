/** Site-wide facts. Everything here is also shown on screen (footer, author pages). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hulbert-research-site.vercel.app").replace(/\/$/, "");

export const SITE = {
  name: "헐버트 연구 보고서",
  title: "호머 베절릴 헐버트(Homer B. Hulbert) 종합 학술 연구 보고서",
  description:
    "호머 베절릴 헐버트(Homer Bezaleel Hulbert, 1863–1949)의 생애와 활동을 (사)헐버트박사기념사업회 자료와 1차 사료를 바탕으로 정리한 연구 보고서와 칼럼.",
  locale: "ko_KR",
  /** Operator / publisher shown in the footer and used in Organization JSON-LD. */
  publisher: {
    name: "함께봄",
    logo: "/logo.png",
  },
  copyrightYear: 2026,
  /** First publication of the report (first deploy, git d150b45) and last content change. */
  reportPublished: "2026-06-11",
  reportModified: "2026-11-14",
} as const;

export type Author = { slug: string; name: string; bio: string };

/** Column authors. A post's author_name must match one of these names. */
export const AUTHORS: Author[] = [
  {
    slug: "hamkkebom",
    name: "함께봄",
    bio: "함께봄은 이 사이트를 운영하며, 호머 헐버트 박사에 관한 연구 보고서와 칼럼을 펴냅니다.",
  },
];

export function authorByName(name: string) {
  return AUTHORS.find((a) => a.name === name);
}

export function abs(path: string) {
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}
