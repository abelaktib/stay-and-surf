import Image from "next/image";
import PageShell from "@/components/PageShell";
import JsonLd from "@/components/JsonLd";
import { guideContent, GUIDE_UPDATED, GUIDE_SOURCES } from "@/lib/guide";
import { articleLd, breadcrumbLd, pageMeta } from "@/lib/seo";

const PATH = "/surf-oualidia";
const IMAGE = "/photos/facade-escalier.webp";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const g = guideContent(locale);
  return pageMeta({ locale, path: PATH, title: g.metaTitle, description: g.description });
}

export default async function Guide({ params }) {
  const { locale } = await params;
  const g = guideContent(locale);
  const date = new Date(GUIDE_UPDATED + "T00:00:00Z").toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <PageShell locale={locale} className="page page-guide">
      <JsonLd data={articleLd({ locale, path: `/${locale}${PATH}`, title: g.title, description: g.description, updated: GUIDE_UPDATED, image: IMAGE })} />
      <JsonLd data={breadcrumbLd([[g.home, `/${locale}`], [g.crumb, `/${locale}${PATH}`]])} />
      <article className="wrap guide">
        <nav className="crumbs" aria-label={locale === "fr" ? "Fil d’Ariane" : "Breadcrumb"}>
          <a href={`/${locale}`}>{g.home}</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{g.crumb}</span>
        </nav>
        <header className="guide-head">
          <h1 className="h2">{g.title}</h1>
          <p className="guide-updated">
            {g.updated} <time dateTime={GUIDE_UPDATED}>{date}</time>
          </p>
          <p className="lead guide-lead">{g.lead}</p>
        </header>

        <div className="guide-body">
          {g.sections.map((s) => (
            <section key={s.id} id={s.id} className="guide-section">
              <h2>{s.h}</h2>
              {s.p.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {s.table && (
                <div className="guide-table-wrap">
                  <table className="guide-table">
                    <thead>
                      <tr>
                        {s.table.head.map((h) => (
                          <th key={h} scope="col">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.table.rows.map((r) => (
                        <tr key={r[0]}>
                          <th scope="row">{r[0]}</th>
                          <td>{r[1]}</td>
                          <td>{r[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          <aside className="guide-cta" aria-labelledby="guide-cta-title">
            <div className="guide-cta-img">
              <Image src={IMAGE} alt="" fill sizes="(max-width: 900px) 100vw, 360px" style={{ objectFit: "cover" }} />
            </div>
            <div>
              <h2 id="guide-cta-title">{g.cta.h}</h2>
              <p>{g.cta.p}</p>
              <div className="status-actions">
                <a className="btn" href={`/${locale}#reserver`}>{g.cta.book}</a>
                <a className="btn btn-ghost" href={`/${locale}#maison`}>{g.cta.house}</a>
              </div>
            </div>
          </aside>

          <section className="guide-sources" aria-labelledby="guide-sources-title">
            <h2 id="guide-sources-title">{g.sourcesTitle}</h2>
            <ul>
              {GUIDE_SOURCES.map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="noopener noreferrer" target="_blank">{s.name}</a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </PageShell>
  );
}
