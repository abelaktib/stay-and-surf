import localFont from "next/font/local";

/*
 * Polices auto-hébergées via next/font : préchargement automatique et police de repli
 * ajustée aux mêmes dimensions, ce qui évite le décalage de mise en page au chargement.
 */
export const display = localFont({
  src: "../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
  variable: "--font-display",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
  adjustFontFallback: "Arial",
  fallback: ["Arial Narrow", "sans-serif"],
});

export const text = localFont({
  src: "../node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-standard-normal.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap",
  variable: "--font-text",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
  adjustFontFallback: "Arial",
  fallback: ["system-ui", "sans-serif"],
});
