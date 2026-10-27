"use client";

import { useParams } from "next/navigation";
import PageShell from "@/components/PageShell";
import Star from "@/components/Star";
import { getDict } from "@/lib/i18n";

export default function NotFound() {
  const { locale = "fr" } = useParams() || {};
  const t = getDict(locale).notFound;
  return (
    <PageShell locale={locale} className="page page-status">
      <Star className="status-star" />
      <p className="status-code" aria-hidden="true">404</p>
      <h1 className="h2">{t.title}</h1>
      <p className="lead">{t.text}</p>
      <div className="status-actions">
        <a className="btn" href={`/${locale}`}>{t.back}</a>
        <a className="btn btn-ghost" href={`/${locale}#reserver`}>{t.book}</a>
      </div>
    </PageShell>
  );
}
