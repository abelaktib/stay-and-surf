import "./globals.css";

export const metadata = {
  title: "Stay & Surf — Séjours surf à Oualidia, Maroc",
  description:
    "Maison d'hôtes face à l'océan, à Oualidia, pour surfer la côte sauvage du Maroc. Dar Nejma : piscine privée, pension complète, 4 voyageurs max.",
  metadataBase: new URL("https://stayandsurf.com"),
  openGraph: {
    title: "Stay & Surf — Oualidia",
    description:
      "Surfez la côte sauvage du Maroc depuis Dar Nejma, à quelques pas de l'océan.",
    type: "website",
    locale: "fr_FR",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
