import Image from "next/image";
import PageShell from "@/components/PageShell";
import { getDict } from "@/lib/i18n";
import { stripe, APP_TAG } from "@/lib/availability";
import { isISODate } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function Merci({ params, searchParams }) {
  const { locale } = await params;
  const { session_id } = await searchParams;
  const d = getDict(locale);
  const t = d.thanks;

  let session = null;
  if (stripe && typeof session_id === "string" && /^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(session_id)) {
    session = await stripe.checkout.sessions.retrieve(session_id).catch(() => null);
    if (session?.metadata?.app !== APP_TAG) session = null;
  }
  const m = session?.metadata || {};
  const paid = session?.payment_status === "paid" && isISODate(m.checkIn) && isISODate(m.checkOut);
  const fmt = (iso) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString(d.dateLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    });

  return (
    <PageShell locale={locale} className="thanks">
      <div className="thanks-inner">
        <div className="arch">
          <Image src="/photos/rooftop-nuit.webp" alt="" fill sizes="260px" style={{ objectFit: "cover", transform: "none" }} />
        </div>
        <h1 className="h2">{paid ? t.title : t.pendingTitle}</h1>
        <p>{paid ? t.text((m.name || "").split(" ")[0], fmt(m.checkIn), fmt(m.checkOut)) : t.pending}</p>
        <a className="btn" href={`/${locale}`}>
          {t.back}
        </a>
      </div>
    </PageShell>
  );
}
