import { ImageResponse } from "next/og";
import { SITE } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };

/** Fetches only the glyphs needed from Google Fonts (Noto Serif KR). Falls back to no custom font. */
async function loadFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@700&text=${encodeURIComponent(text)}`,
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Share card: site name, title, optional kicker, publisher. All text, no photos. */
export async function ogCard({ title, kicker }: { title: string; kicker?: string }) {
  const footer = `${SITE.name} · ${SITE.publisher.name}`;
  const font = await loadFont(title + (kicker ?? "") + footer);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafaf6",
          color: "#1a1a1a",
          padding: "70px 80px",
          borderLeft: "24px solid #b8860b",
          fontFamily: font ? "NotoSerifKR" : "serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 32, color: "#8b6914" }}>{kicker ?? SITE.name}</div>
        <div style={{ display: "flex", fontSize: title.length > 40 ? 52 : 64, fontWeight: 700, lineHeight: 1.3 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#666" }}>{footer}</div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: font ? [{ name: "NotoSerifKR", data: font, weight: 700, style: "normal" }] : undefined,
    },
  );
}
