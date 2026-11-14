"use client";

export function BackToTop() {
  return (
    <button
      id="back-to-top"
      type="button"
      title="맨 위로"
      aria-label="맨 위로"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      ↑
    </button>
  );
}
