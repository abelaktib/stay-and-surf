"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getDict } from "@/lib/i18n";

const BookingWidget = dynamic(() => import("./Booking"), { ssr: false, loading: () => null });

/**
 * Charge le calendrier (et son JavaScript) seulement quand la section approche de l'écran,
 * ou tout de suite si l'adresse pointe déjà vers la réservation. Allège le chargement initial.
 */
export default function BookingLazy({ locale }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (location.hash === "#reserver" || location.search.includes("annule")) return setShow(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { rootMargin: "1200px 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  if (show) return <BookingWidget locale={locale} />;
  return (
    <div ref={ref} className="book-grid" aria-busy="true">
      <div className="panel">
        <div className="cal-skeleton" />
        <p className="cal-hint">{getDict(locale).book.loading}</p>
      </div>
      <div className="panel summary cal-skeleton" style={{ minHeight: 280 }} />
    </div>
  );
}
