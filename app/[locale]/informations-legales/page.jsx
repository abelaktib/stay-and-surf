import PageShell from "@/components/PageShell";
import { legalContent } from "@/lib/legal";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/config";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const c = legalContent(locale);
  return pageMeta({ locale, path: "/informations-legales", title: `${c.title} | ${SITE.name}`, description: c.description });
}

export default async function Legal({ params }) {
  const { locale } = await params;
  const c = legalContent(locale);
  return (
    <PageShell locale={locale} className="page page-legal">
      <JsonLd data={breadcrumbLd([[locale === "fr" ? "Accueil" : "Home", `/${locale}`], [c.title, `/${locale}/informations-legales`]])} />
      <div className="wrap legal">
        <h1 className="h2">{c.title}</h1>
        <p className="legal-updated">{c.updated}</p>
        <nav className="legal-toc" aria-label={c.title}>
          {c.sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>{s.h}</a>
          ))}
        </nav>
        {c.sections.map((s) => (
          <section key={s.id} id={s.id} className="legal-section">
            <h2>{s.h}</h2>
            {s.p.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        ))}
      </div>
    </PageShell>
  );
}
