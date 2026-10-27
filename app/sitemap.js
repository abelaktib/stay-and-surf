import { SITE } from "@/lib/config";

export default function sitemap() {
  const now = new Date();
  return ["fr", "en"].map((l) => ({
    url: `${SITE.url}/${l}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: l === "fr" ? 1 : 0.9,
    alternates: { languages: { fr: `${SITE.url}/fr`, en: `${SITE.url}/en` } },
  }));
}
