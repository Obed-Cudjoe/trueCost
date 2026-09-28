// XML sitemap — canonical, public, indexable routes only.
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getAreas, getGuides, getLegal, getNews, getRights } from "@/lib/content";

interface SitemapItem { path: string; updated?: string }

function entry(item: SitemapItem): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE.url}${item.path === "/" ? "/" : item.path}`,
    // Only explicit ISO content-update dates are emitted. Never use build time.
    ...(item.updated && /^\d{4}-\d{2}-\d{2}$/.test(item.updated) ? { lastModified: item.updated } : {}),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const privacy = getLegal("privacy");
  const terms = getLegal("terms");
  const staticPages: SitemapItem[] = [
    { path: "/" },
    { path: "/areas" },
    { path: "/calculator" },
    { path: "/news" },
    { path: "/rights" },
    { path: "/about" },
    { path: "/contact" },
    { path: "/get-help" },
    { path: "/list-property" },
    { path: "/listings" },
    { path: "/privacy", updated: privacy?.updated },
    { path: "/terms", updated: terms?.updated },
  ];
  return [
    ...staticPages.map(entry),
    ...getAreas().map((a) => entry({ path: `/areas/${a.slug}`, updated: a.updated })),
    ...getGuides().map((g) => entry({ path: `/guides/${g.slug}`, updated: g.updated })),
    ...getNews().map((n) => entry({ path: `/news/${n.slug}`, updated: n.updated })),
    ...getRights().map((r) => entry({ path: `/rights/${r.slug}`, updated: r.updated })),
  ];
}
