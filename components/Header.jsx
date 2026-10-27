"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import Star from "./Star";
import { getDict } from "@/lib/i18n";

export default function Header({ locale, solid = false }) {
  const t = getDict(locale).nav;
  const [phase, setPhase] = useState(solid ? "solid" : "top");
  const [open, setOpen] = useState(false);
  const menuBtn = useRef(null);
  const closeBtn = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (solid) return;
    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      setPhase(y < vh * 0.45 ? "top" : y < vh * 1.25 ? "image" : "solid");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [solid]);

  // Menu mobile : défilement bloqué, focus sur « Fermer », Échap pour fermer, focus rendu au bouton
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
    if (open) {
      wasOpen.current = true;
      requestAnimationFrame(() => closeBtn.current?.focus());
      const onKey = (e) => {
        if (e.key === "Escape") setOpen(false);
        if (e.key === "Tab") {
          const items = [...document.querySelectorAll("#menu-mobile a, #menu-mobile button")];
          const first = items[0];
          const last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    if (wasOpen.current) menuBtn.current?.focus();
  }, [open]);

  const base = `/${locale}`;
  const links = [
    ["#maison", t.house],
    ["#sejour", t.stay],
    ["#oualidia", t.place],
    ["#questions", t.faq],
  ];
  const other = locale === "fr" ? "en" : "fr";
  // Le changement de langue garde la page en cours (ex. /fr/surf-oualidia ↔ /en/surf-oualidia)
  const pathname = usePathname() || `/${locale}`;
  const inLang = (l) => pathname.replace(/^\/(fr|en)(?=\/|$)/, `/${l}`);

  return (
    <>
      <a className="skip-link" href="#contenu">
        {t.skip}
      </a>
      <header
        className={`header ${phase === "solid" ? "is-solid" : ""}`}
        style={{ color: phase === "image" ? "var(--sand-soft)" : "var(--ink)" }}
      >
        <div className="wrap header-inner">
          <a href={base} className="brand" aria-label={t.home} translate="no">
            <Star />
            Stay &amp; Surf
          </a>
          <nav className="nav" aria-label={t.label}>
            {links.map(([h, l]) => (
              <a key={h} href={`${base}${h}`}>
                {l}
              </a>
            ))}
            <div className="lang" role="group" aria-label={t.lang}>
              <a href={inLang("fr")} aria-current={locale === "fr" ? "page" : undefined} hrefLang="fr" lang="fr">
                FR
              </a>
              <a href={inLang("en")} aria-current={locale === "en" ? "page" : undefined} hrefLang="en" lang="en">
                EN
              </a>
            </div>
            <a href={`${base}#reserver`} className="btn">
              {t.book}
            </a>
          </nav>
          <button
            type="button"
            className="menu-btn"
            ref={menuBtn}
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-haspopup="dialog"
          >
            {t.menu}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={t.menu}
            id="menu-mobile"
          >
            <div className="mobile-menu-top">
              <span className="brand" translate="no">
                <Star />
                Stay &amp; Surf
              </span>
              <button type="button" className="menu-btn" style={{ display: "block" }} onClick={() => setOpen(false)} ref={closeBtn}>
                {t.close}
              </button>
            </div>
            <nav aria-label={t.label}>
              {links.map(([h, l], i) => (
                <motion.a
                  key={h}
                  href={`${base}${h}`}
                  onClick={() => setOpen(false)}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.5 }}
                >
                  {l}
                </motion.a>
              ))}
            </nav>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a href={`${base}#reserver`} className="btn" onClick={() => setOpen(false)}>
                {t.book}
              </a>
              <a href={inLang(other)} hrefLang={other} lang={other} className="menu-lang">
                {other.toUpperCase()}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
