import { SITE, STAY } from "./config";
import { getDict } from "./i18n";

/* Données structurées Schema.org partagées. Uniquement des faits vérifiables : ni note ni avis inventés. */
const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;

export function siteGraph() {
  const sameAs = [SITE.instagram && `https://instagram.com/${SITE.instagram}`].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE.name,
        url: SITE.url,
        logo: `${SITE.url}/icon.svg`,
        email: SITE.email,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        name: `${SITE.name}, ${SITE.house}`,
        url: SITE.url,
        publisher: { "@id": ORG_ID },
        inLanguage: ["fr", "en"],
      },
    ],
  };
}

export function rentalLd(locale) {
  const t = getDict(locale);
  return {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    "@id": `${SITE.url}/#dar-nejma`,
    name: `${SITE.house}, ${SITE.name}`,
    description: t.meta.description,
    url: `${SITE.url}/${locale}`,
    brand: { "@id": ORG_ID },
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
      occupancy: { "@type": "QuantitativeValue", maxValue: STAY.maxGuests },
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
      description: t.stay.unit,
      url: `${SITE.url}/${locale}#reserver`,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: STAY.weeklyPricePerPerson,
        priceCurrency: "EUR",
        unitText: t.stay.unit,
      },
    },
    inLanguage: locale,
  };
}

/** Fil d'Ariane : [[nom, chemin], …] */
export function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE.url}${path}`,
    })),
  };
}

export function articleLd({ locale, path, title, description, updated, image }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: locale,
    url: `${SITE.url}${path}`,
    mainEntityOfPage: `${SITE.url}${path}`,
    image: `${SITE.url}${image}`,
    datePublished: updated,
    dateModified: updated,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    about: { "@type": "Place", name: "Oualidia", geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng } },
  };
}

/** Métadonnées d'une page secondaire bilingue (canonique, hreflang, Open Graph complet) */
export function pageMeta({ locale, path, title, description, image = "/og.jpg" }) {
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: { fr: `/fr${path}`, en: `/en${path}`, "x-default": `/fr${path}` },
    },
    openGraph: {
      type: "article",
      siteName: `${SITE.name}, ${SITE.house}`,
      title,
      description,
      url: `/${locale}${path}`,
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      alternateLocale: locale === "fr" ? ["en_GB"] : ["fr_FR"],
      images: [{ url: image, width: 1200, height: 630, alt: SITE.house }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
