"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Star from "./Star";
import { getDict } from "@/lib/i18n";

export default function Header({ locale, solid = false }) {
  const t = getDict(locale).nav;
  const [phase, setPhase] = useState(solid ? "solid" : "top");
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  }, [open]);

  const base = `/${locale}`;
  const links = [
    ["#maison", t.house],
    ["#sejour", t.stay],
    ["#oualidia", t.place],
    ["#questions", t.faq],
  ];
  const other = locale === "fr" ? "en" : "fr";

  return (
    <>
      <header
        className={`header ${phase === "solid" ? "is-solid" : ""}`}
        style={{ color: phase === "image" ? "var(--sand-soft)" : "var(--ink)" }}
      >
        <div className="wrap header-inner">
          <a href={base} className="brand" aria-label="Stay & Surf, Dar Nejma">
            <Star />
            Stay &amp; Surf
          </a>
          <nav className="nav" aria-label="Navigation principale">
            {links.map(([h, l]) => (
              <a key={h} href={`${base}${h}`}>
                {l}
              </a>
            ))}
            <div className="lang">
              <a href="/fr" aria-current={locale === "fr"} hrefLang="fr">
                FR
              </a>
              <a href="/en" aria-current={locale === "en"} hrefLang="en">
                EN
              </a>
            </div>
            <a href={`${base}#reserver`} className="btn">
              {t.book}
            </a>
          </nav>
          <button className="menu-btn" onClick={() => setOpen(true)} aria-expanded={open}>
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
          >
            <div className="mobile-menu-top">
              <span className="brand">
                <Star />
                Stay &amp; Surf
              </span>
              <button className="menu-btn" style={{ display: "block" }} onClick={() => setOpen(false)}>
                {t.close}
              </button>
            </div>
            <nav>
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
              <a href={`/${other}`} hrefLang={other} style={{ fontWeight: 600 }}>
                {other.toUpperCase()}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
