// Auto-generated XML sitemap — every guide discoverable by search engines.
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getAreas, getGuides, getNews, getRights } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls = (paths: string[]) => paths.map((p) => ({ url: `${SITE.url}${p}`, lastModified: now }));
  return [
    ...urls(["/", "/areas", "/calculator", "/news", "/rights", "/about", "/contact", "/get-help", "/privacy", "/terms"]),
    ...urls(getAreas().map((a) => `/areas/${a.slug}`)),
    ...urls(getGuides().map((g) => `/guides/${g.slug}`)),
    ...urls(getNews().map((n) => `/news/${n.slug}`)),
    ...urls(getRights().map((r) => `/rights/${r.slug}`)),
  ];
}
