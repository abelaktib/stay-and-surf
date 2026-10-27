"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { useReady } from "./Experience";
import { getDict } from "@/lib/i18n";

export const HERO_IMG =
  "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=2400&q=80";

/**
 * Géométrie de la porte en arche, en pixels.
 * Bureau : arche à droite. Mobile : arche centrée en haut.
 */
function archBox(vw, vh) {
  if (vw < 760) {
    const w = Math.min(vw * 0.64, vh * 0.3);
    const h = w / 0.66;
    return { left: (vw - w) / 2, top: vh * 0.13, w, h };
  }
  const h = vh * 0.48;
  const w = h * 0.64;
  return { left: vw - w - Math.max(vw * 0.09, 40), top: vh * 0.11, w, h };
}

const lerp = (a, b, t) => a + (b - a) * t;

export default function Hero({ locale }) {
  const t = getDict(locale).hero;
  const ref = useRef(null);
  const dims = useRef({ vw: 1440, vh: 900 });
  const ready = useReady();
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // 0 → 1 : l'arche s'élève au chargement
  const rise = useMotionValue(0);
  const resized = useMotionValue(0);

  useEffect(() => {
    const set = () => {
      dims.current = { vw: window.innerWidth, vh: window.innerHeight };
      resized.set(resized.get() + 1); // force un recalcul
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, [resized]);

  useEffect(() => {
    if (!ready) return;
    if (reduce) {
      rise.set(1);
      return;
    }
    const c = animate(rise, 1, { duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.05 });
    return () => c.stop();
  }, [ready, reduce, rise]);

  // Sous "réduire les animations", l'arche reste fixe et lisible
  const open = useTransform(scrollYProgress, [0, 0.62], reduce ? [0, 0] : [0, 1], { clamp: true });

  const clip = useTransform([open, rise, resized], ([o, r]) => {
    const { vw, vh } = dims.current;
    const b = archBox(vw, vh);
    const e = o < 0.5 ? 4 * o * o * o : 1 - Math.pow(-2 * o + 2, 3) / 2; // easeInOutCubic
    const bottomEdge = b.top + b.h;
    const top0 = bottomEdge - b.h * r;
    const top = lerp(top0, 0, e);
    const left = lerp(b.left, 0, e);
    const right = lerp(vw - b.left - b.w, 0, e);
    const bottom = lerp(vh - bottomEdge, 0, e);
    const rad = lerp(b.w / 2, 0, e);
    return `inset(${top}px ${right}px ${bottom}px ${left}px round ${rad}px ${rad}px ${lerp(6, 0, e)}px ${lerp(6, 0, e)}px)`;
  });

  const imgScale = useTransform(open, [0, 1], [1.35, 1]);
  const copyOpacity = useTransform(scrollYProgress, [0.04, 0.3], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const overOpacity = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const overY = useTransform(scrollYProgress, [0.55, 0.8], [60, 0]);

  const line = {
    hidden: { y: "105%" },
    show: (i) => ({
      y: "0%",
      transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.35 + i * 0.1 },
    }),
  };

  return (
    <section className="hero" ref={ref} aria-label={`${t.l1} ${t.l2}`} style={reduce ? { height: "100vh" } : undefined}>
      <div className="hero-stage">
        <motion.div className="hero-arch" style={{ clipPath: clip }}>
          <motion.div style={{ position: "absolute", inset: 0, scale: imgScale }}>
            <Image
              src={HERO_IMG}
              alt={locale === "fr" ? "Surfeur dans une vague de l’Atlantique" : "Surfer riding an Atlantic wave"}
              fill
              priority
              sizes="100vw"
            />
          </motion.div>
        </motion.div>

        <motion.div className="hero-copy" style={reduce ? undefined : { opacity: copyOpacity, y: copyY }}>
          <h1 className="display hero-title">
            {[t.l1, t.l2].map((l, i) => (
              <span key={i}>
                <motion.span
                  custom={i}
                  variants={line}
                  initial="hidden"
                  animate={ready ? "show" : "hidden"}
                >
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div
            className="hero-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <p>{t.sub}</p>
            <a href={`/${locale}#reserver`} className="btn">
              {t.cta}
            </a>
          </motion.div>
        </motion.div>

        <motion.div className="hero-over" style={{ opacity: reduce ? 0 : overOpacity }} aria-hidden="true">
          <motion.p style={{ y: overY }}>{t.over}</motion.p>
        </motion.div>

        <motion.span
          className="hero-cue"
          style={{ opacity: copyOpacity }}
        >
          {t.scroll}
        </motion.span>
      </div>
    </section>
  );
}
