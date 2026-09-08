// robots.txt — allow all, point at sitemap, keep /admin + /api out of the index.
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
