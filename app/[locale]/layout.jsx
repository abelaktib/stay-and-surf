import { display, text } from "../fonts";
import "../globals.css";
import { notFound } from "next/navigation";
import { LOCALES, getDict } from "@/lib/i18n";
import { SITE } from "@/lib/config";
import { siteGraph } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const dynamicParams = false;

const INTRO_SCRIPT =
  "try{var s=sessionStorage;if(s.getItem('dn-intro'))document.documentElement.classList.add('intro-seen');s.setItem('dn-intro','1')}catch(e){}";
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport = {
  themeColor: "#0f4d48",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = getDict(locale).meta;
  return {
    metadataBase: new URL(SITE.url),
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: "/fr", en: "/en", "x-default": "/fr" },
    },
    openGraph: {
      type: "website",
      siteName: `${SITE.name}, ${SITE.house}`,
      title: t.title,
      description: t.description,
      url: `/${locale}`,
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: SITE.house }],
    },
    twitter: { card: "summary_large_image", title: t.title, description: t.description, images: ["/og.jpg"] },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  if (!LOCALES.includes(locale)) notFound();
  return (
    <html lang={locale} className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <body>
        {/* Avant tout affichage : le voile d'ouverture ne se joue qu'une fois par session */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        <JsonLd data={siteGraph()} />
        {children}
      </body>
    </html>
  );
}
