import { SITE } from "@/lib/config";

const BUILT = new Date();

export default function sitemap() {
  const page = (path, priority, changeFrequency) =>
    ["fr", "en"].map((l) => ({
      url: `${SITE.url}/${l}${path}`,
      lastModified: BUILT,
      changeFrequency,
      priority: l === "fr" ? priority : Math.round(priority * 90) / 100,
      alternates: { languages: { fr: `${SITE.url}/fr${path}`, en: `${SITE.url}/en${path}`, "x-default": `${SITE.url}/fr${path}` } },
    }));
  return [...page("", 1, "weekly"), ...page("/surf-oualidia", 0.8, "monthly"), ...page("/informations-legales", 0.3, "yearly")];
}
