import { ogCard, OG_SIZE } from "@/lib/og";
import { SITE } from "@/lib/site";

export const alt = SITE.title;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({ title: SITE.title });
}
