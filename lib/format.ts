/** "2026-11-14" or ISO timestamp → "2026년 11월 14일" (Korea time). */
export function formatDate(value: string) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + "T00:00:00+09:00") : new Date(value);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/** Date part in Korea time, for dateTime attributes on day-precision dates. */
export function isoDay(value: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date(value));
}
