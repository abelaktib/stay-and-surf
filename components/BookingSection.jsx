import BookingLazy from "./BookingLazy";
import { getDict } from "@/lib/i18n";
import { STAY } from "@/lib/config";

// Titre rendu côté serveur ; le calendrier interactif se charge à l'approche de la section
export default function BookingSection({ locale }) {
  const t = getDict(locale).book;
  return (
    <section className="book" id="reserver" aria-labelledby="book-title">
      <div className="wrap">
        <div className="book-head">
          <h2 className="h2" id="book-title">{t.title}</h2>
          <p className="lead">
            {t.lead} {t.min(STAY.minNights)}.
          </p>
        </div>
        <BookingLazy locale={locale} />
      </div>
    </section>
  );
}
