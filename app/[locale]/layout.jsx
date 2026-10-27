import { display, text } from "../fonts";
import "../globals.css";
import { notFound } from "next/navigation";
import { LOCALES, getDict } from "@/lib/i18n";
import { SITE, STAY } from "@/lib/config";

export const dynamicParams = false;

const INTRO_SCRIPT =
  "try{var s=sessionStorage;if(s.getItem('dn-intro'))document.documentElement.classList.add('intro-seen');s.setItem('dn-intro','1')}catch(e){}";
// JSON-LD sûr dans une balise <script> : on échappe les caractères qui pourraient la fermer
const jsonLdString = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
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
  const t = getDict(locale);

  // Données structurées : location de vacances + offre de séjour
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: `${SITE.house}, ${SITE.name}`,
    description: t.meta.description,
    url: `${SITE.url}/${locale}`,
    image: [`${SITE.url}/og.jpg`, `${SITE.url}/photos/salon.webp`, `${SITE.url}/photos/rooftop-jour.webp`],
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    containsPlace: {
      "@type": "Accommodation",
      additionalType: "EntirePlace",
      occupancy: { "@type": "QuantitativeValue", value: STAY.maxGuests },
      numberOfBedrooms: 2,
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: locale === "fr" ? "Toit-terrasse" : "Rooftop terrace", value: true },
        { "@type": "LocationFeatureSpecification", name: locale === "fr" ? "Cuisine équipée" : "Kitchen", value: true },
        { "@type": "LocationFeatureSpecification", name: "Wifi", value: true },
      ],
    },
    makesOffer: {
      "@type": "Offer",
      name: t.stay.title,
      price: STAY.weeklyPricePerPerson,
      priceCurrency: "EUR",
      description: t.stay.unit,
    },
    inLanguage: locale,
  };

  return (
    <html lang={locale} className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <body>
        {/* Avant tout affichage : le voile d'ouverture ne se joue qu'une fois par session */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
