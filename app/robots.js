import { SITE } from "@/lib/config";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/fr/merci", "/en/merci"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
