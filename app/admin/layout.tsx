import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1200px] px-4 py-6 text-[16px] leading-relaxed">{children}</div>;
}
