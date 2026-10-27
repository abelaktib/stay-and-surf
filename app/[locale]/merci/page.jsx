import Image from "next/image";
import Experience from "@/components/Experience";
import Header from "@/components/Header";
import { Footer } from "@/components/Sections";
import { getDict } from "@/lib/i18n";
import { SITE } from "@/lib/config";
import { stripe } from "@/lib/availability";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function Merci({ params, searchParams }) {
  const { locale } = await params;
  const { session_id } = await searchParams;
  const d = getDict(locale);
  const t = d.thanks;

  let session = null;
  if (stripe && typeof session_id === "string" && session_id.startsWith("cs_")) {
    session = await stripe.checkout.sessions.retrieve(session_id).catch(() => null);
  }
  const paid = session?.payment_status === "paid";
  const fmt = (iso) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString(d.dateLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    });

  return (
    <Experience house={SITE.house} intro={false}>
      <Header locale={locale} solid />
      <main className="thanks">
        <div className="thanks-inner">
          <div className="arch">
            <Image src="/photos/rooftop-nuit.webp" alt="" fill sizes="260px" style={{ objectFit: "cover", transform: "none" }} />
          </div>
          <h1 className="h2">{t.title}</h1>
          <p>
            {paid
              ? t.text(session.metadata.name.split(" ")[0], fmt(session.metadata.checkIn), fmt(session.metadata.checkOut))
              : t.pending}
          </p>
          <a className="btn" href={`/${locale}`}>
            {t.back}
          </a>
        </div>
      </main>
      <Footer locale={locale} />
    </Experience>
  );
}
