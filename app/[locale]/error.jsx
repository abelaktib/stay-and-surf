"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Star from "@/components/Star";
import { getDict } from "@/lib/i18n";
import { SITE } from "@/lib/config";

// Erreur de rendu : message clair et bouton pour réessayer, sans détail technique
export default function ErrorPage({ error, reset }) {
  const { locale = "fr" } = useParams() || {};
  const t = getDict(locale).error;
  useEffect(() => {
    console.error(error?.digest || error?.message);
  }, [error]);
  return (
    <main id="contenu" className="page page-status">
      <Star className="status-star" />
      <h1 className="h2">{t.title}</h1>
      <p className="lead">{t.text}</p>
      <div className="status-actions">
        <button type="button" className="btn" onClick={() => reset()}>{t.retry}</button>
        <a className="btn btn-ghost" href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </div>
    </main>
  );
}
