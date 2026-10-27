"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import Lenis from "lenis";
import Star from "./Star";

const ReadyCtx = createContext(true);
export const useReady = () => useContext(ReadyCtx);

/**
 * Défilement fluide (Lenis) + voile d'ouverture avec l'étoile.
 * Le voile n'apparaît qu'à la première visite de la session.
 */
export default function Experience({ children, house, intro = true }) {
  const reduce = useReducedMotion();
  const [veil, setVeil] = useState(intro);
  const [ready, setReady] = useState(!intro);

  useEffect(() => {
    if (!intro) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem("dn-intro") === "1";
      sessionStorage.setItem("dn-intro", "1");
    } catch {}
    if (seen || reduce) {
      setVeil(false);
      setReady(true);
      return;
    }
    const t = setTimeout(() => setVeil(false), 1500);
    return () => clearTimeout(t);
  }, [intro, reduce]);

  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    window.__lenis = lenis;
    let id;
    const raf = (t) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    // Liens d'ancre : défilement fluide
    const onClick = (e) => {
      const a = e.target.closest('a[href*="#"]');
      if (!a) return;
      const url = new URL(a.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const el = document.querySelector(url.hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -20, duration: 1.6 });
      history.replaceState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [reduce]);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  return (
    <ReadyCtx.Provider value={ready}>
      <motion.div className="read-progress" style={{ scaleX: progress }} aria-hidden="true" />
      {children}
      <AnimatePresence onExitComplete={() => setReady(true)}>
        {veil && (
          <motion.div
            className="intro-veil"
            initial={{ y: 0 }}
            exit={{ y: "-100%", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
          >
            <div>
              <motion.div
                initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <Star />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.7 }}
              >
                {house}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ReadyCtx.Provider>
  );
}
