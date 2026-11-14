import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// All crawlers, including AI search bots, may read public pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
