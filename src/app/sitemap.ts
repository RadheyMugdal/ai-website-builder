import { defaultCanonical, siteUrl } from "@/lib/seo";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  const routes = ["", "/pricing"];

  return routes.map((route) => ({
    url: defaultCanonical(route),
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
