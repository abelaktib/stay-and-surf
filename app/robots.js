import { SITE } from "@/lib/config";

export default function robots() {
  // Les aperçus Vercel (branches de test) ne doivent jamais être indexés
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/fr/merci", "/en/merci"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
