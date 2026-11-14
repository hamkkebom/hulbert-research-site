import { SITE, SITE_URL, abs } from "./site";

/** schema.org objects. Every value here is also visible on the page it is used on. */
export const ORG_ID = SITE_URL + "/#organization";
export const WEBSITE_ID = SITE_URL + "/#website";

export function organization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.publisher.name,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: abs(SITE.publisher.logo), width: 512, height: 512 },
  };
}

export function website() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE.name,
    alternateName: SITE.title,
    url: SITE_URL,
    inLanguage: "ko",
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export const publisherRef = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE.publisher.name,
  logo: { "@type": "ImageObject", url: abs(SITE.publisher.logo), width: 512, height: 512 },
};
