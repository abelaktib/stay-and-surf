import Image from "next/image";
import Star from "./Star";
import { getDict } from "@/lib/i18n";
import { SITE } from "@/lib/config";

export function HouseHead({ locale }) {
  const t = getDict(locale).house;
  return (
    <section id="maison" style={{ scrollMarginTop: 60 }}>
      <div className="wrap house-head">
        <h2 className="h2">{t.title}</h2>
        <div>
          <p className="lead">{t.lead}</p>
          <div className="facts">
            {t.facts.map(([n, l]) => (
              <div key={l}>
                <b>{n}</b>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Bande de chevrons, comme le zellige posé au sol de la maison
function Herringbone() {
  return (
    <svg className="herringbone" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <pattern id="hb" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 14 L7 7 L14 14 L21 7 L28 14 M0 28 L7 21 L14 28 L21 21 L28 28" fill="none" stroke="currentColor" strokeWidth="5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hb)" />
    </svg>
  );
}

export function Stay({ locale }) {
  const t = getDict(locale).stay;
  return (
    <section className="stay" id="sejour">
      <Herringbone />
      <div className="wrap stay-grid">
        <div>
          <h2 className="h2">{t.title}</h2>
          <div className="price">
            <small>{t.from}</small>
            <strong>{t.price}</strong>
          </div>
          <p className="price-unit">{t.unit}</p>
          <p className="price-note">{t.note}</p>
          <a href={`/${locale}#reserver`} className="btn">
            {t.cta}
          </a>
        </div>
        <div>
          <h3>{t.includesTitle}</h3>
          <ul className="includes">
            {t.includes.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <h3>{t.weekTitle}</h3>
          <ol className="week">
            {t.week.map((w) => (
              <li key={w.d}>
                <b>{w.d}</b>
                <span>{w.t}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Place({ locale }) {
  const t = getDict(locale).place;
  const fr = locale === "fr";
  return (
    <section className="place" id="oualidia">
      <div className="wrap place-grid">
        <div className="place-copy">
          <h2 className="h2">{t.title}</h2>
          <p className="lead">{t.text}</p>
          <ul className="distances">
            {t.distances.map(([a, b]) => (
              <li key={b}>
                <b>{a}</b>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="place-img tall" style={{ position: "relative" }}>
          <Image
            src="/photos/facade-escalier.webp"
            alt={fr ? "Façade de Dar Nejma sous le ciel bleu, escalier vers le toit" : "Dar Nejma's facade under a blue sky, stairs to the roof"}
            fill
            sizes="(max-width: 900px) 50vw, 32vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="place-img short" style={{ position: "relative" }}>
          <Image
            src="/photos/facade.webp"
            alt={fr ? "Façade crénelée de la maison et feuille de bananier" : "The house's crenellated facade and a banana leaf"}
            fill
            sizes="(max-width: 900px) 50vw, 24vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    </section>
  );
}

export function Faq({ locale }) {
  const t = getDict(locale).faq;
  return (
    <section className="faq" id="questions">
      <div className="wrap faq-grid">
        <h2 className="h2">{t.title}</h2>
        <div>
          {t.items.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                  <path d="M11 3v16M3 11h16" stroke="currentColor" strokeWidth="2" />
                </svg>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer({ locale }) {
  const d = getDict(locale);
  const t = d.footer;
  const n = d.nav;
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div style={{ maxWidth: 320 }}>
            <a href={`/${locale}`} className="brand" style={{ color: "var(--sand)" }}>
              <Star />
              Stay &amp; Surf
            </a>
            <p style={{ opacity: 0.75 }}>{t.tagline}</p>
          </div>
          <div>
            <h4>{SITE.house}</h4>
            <ul>
              <li><a href={`/${locale}#maison`}>{n.house}</a></li>
              <li><a href={`/${locale}#sejour`}>{n.stay}</a></li>
              <li><a href={`/${locale}#reserver`}>{n.book}</a></li>
            </ul>
          </div>
          <div>
            <h4>{t.contact}</h4>
            <ul>
              <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
              {SITE.whatsapp && (
                <li><a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener">WhatsApp</a></li>
              )}
              {SITE.instagram && (
                <li><a href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noopener">Instagram</a></li>
              )}
            </ul>
          </div>
        </div>
        <div className="wordmark" aria-hidden="true">{SITE.house}</div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Stay &amp; Surf. {t.rights}</span>
          <span>{locale === "fr" ? "Oualidia, Maroc" : "Oualidia, Morocco"}</span>
        </div>
      </div>
    </footer>
  );
}
