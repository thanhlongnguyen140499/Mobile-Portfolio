import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${siteUrl}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    ...projects.map((p) => ({
      url: `${siteUrl}/work/${p.slug}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: p.featured ? 0.8 : 0.5,
    })),
  ];
}
