// robots.txt — public pages only; keep submissions, owner tools, and CMS out of search.
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/track"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
