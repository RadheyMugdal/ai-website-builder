import { siteUrl } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/", "/static/", "/server/", "/admin/"],
    },
    sitemap: [`${siteUrl}/sitemap.xml`],
    host: siteUrl,
  };
}
