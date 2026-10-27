const dev = process.env.NODE_ENV !== "production";

/**
 * Politique de sécurité du contenu.
 * - 'unsafe-inline' sur les scripts : nécessaire aux scripts d'hydratation de Next.js
 *   tant que les pages sont statiques (un nonce imposerait un rendu dynamique).
 *   Le site n'affiche aucun contenu saisi par des tiers, ce qui limite le risque XSS.
 * - 'unsafe-inline' sur les styles : les animations écrivent des styles en ligne.
 * - Les images Unsplash passent par l'optimiseur /_next/image, donc 'self' suffit.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${dev ? " ws:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-**" }],
    minimumCacheTTL: 604800,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/photos/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      // Les aperçus Vercel ne doivent pas être indexés
      ...(process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production"
        ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
        : []),
    ];
  },
};
export default nextConfig;
