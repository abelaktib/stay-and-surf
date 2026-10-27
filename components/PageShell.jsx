import Experience from "./Experience";
import Header from "./Header";
import { Footer } from "./Sections";
import { SITE } from "@/lib/config";

/** Gabarit des pages secondaires : en-tête plein, contenu, pied de page. */
export default function PageShell({ locale, children, className = "page" }) {
  return (
    <Experience house={SITE.house} intro={false}>
      <Header locale={locale} solid />
      <main id="contenu" className={className} tabIndex={-1}>
        {children}
      </main>
      <Footer locale={locale} />
    </Experience>
  );
}
