"use client";

import { useEffect } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import Star from "./Star";

/**
 * Enveloppe commune des pages :
 * - voile d'ouverture avec l'étoile (CSS pur : il s'affiche et disparaît même sans JavaScript,
 *   une seule fois par session grâce à la classe `intro-seen` posée par le script de la mise en page) ;
 * - défilement fluide Lenis, chargé après coup et uniquement à la souris (le tactile garde son défilement natif) ;
 * - barre de progression de lecture.
 */
export default function Experience({ children, house, intro = true }) {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let lenis;
    let id;
    let alive = true;
    const onClick = (e) => {
      const a = e.target.closest?.('a[href*="#"]');
      if (!a || !lenis || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(a.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -20, duration: 1.4 });
      history.replaceState(null, "", url.hash);
      // Accessibilité : le focus suit le défilement
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    };
    const start = () =>
      import("lenis").then(({ default: Lenis }) => {
        if (!alive) return;
        lenis = new Lenis({ lerp: 0.1 });
        window.__lenis = lenis;
        const raf = (t) => {
          lenis.raf(t);
          id = requestAnimationFrame(raf);
        };
        id = requestAnimationFrame(raf);
        document.addEventListener("click", onClick);
      });
    const idle = window.requestIdleCallback ? requestIdleCallback(start, { timeout: 2000 }) : setTimeout(start, 600);

    return () => {
      alive = false;
      window.cancelIdleCallback ? cancelIdleCallback(idle) : clearTimeout(idle);
      cancelAnimationFrame(id);
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      window.__lenis = undefined;
    };
  }, []);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  return (
    <>
      <motion.div className="read-progress" style={{ scaleX: progress }} aria-hidden="true" />
      {children}
      {intro && (
        <div className="intro-veil" aria-hidden="true">
          <div>
            <div className="intro-veil-star">
              <Star />
            </div>
            <p translate="no">{house}</p>
          </div>
        </div>
      )}
    </>
  );
}
