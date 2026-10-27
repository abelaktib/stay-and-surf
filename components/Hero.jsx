"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useScroll, useTransform, useReducedMotion } from "motion/react";
import { getDict } from "@/lib/i18n";

export const HERO_IMG =
  "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=2400&q=80";

/**
 * Géométrie de la porte en arche, en pixels, relative à la scène du héros.
 * Doit rester identique aux variables CSS de `.hero-arch` (globals.css) :
 * le CSS dessine l'arche avant le JavaScript, puis le scroll prend le relais sans saut.
 */
export function archBox(vw, vh) {
  if (vw < 760) {
    // Mobile : l'arche reste au-dessus du titre, même sur les petits écrans
    const w = Math.min(vw * 0.56, vh * (vh < 640 ? 0.18 : 0.24));
    const h = w / 0.66;
    return { left: (vw - w) / 2, top: vh * 0.1, w, h };
  }
  const h = vh * 0.48;
  const w = h * 0.64;
  return { left: vw - w - Math.max(vw * 0.09, 40), top: vh * 0.11, w, h };
}

const lerp = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = (o) => (o < 0.5 ? 4 * o * o * o : 1 - Math.pow(-2 * o + 2, 3) / 2);

export function archClip(vw, vh, o) {
  const b = archBox(vw, vh);
  const e = easeInOutCubic(o);
  const bottomEdge = b.top + b.h;
  const rad = lerp(b.w / 2, 0, e);
  const foot = lerp(6, 0, e);
  return `inset(${lerp(b.top, 0, e)}px ${lerp(vw - b.left - b.w, 0, e)}px ${lerp(vh - bottomEdge, 0, e)}px ${lerp(b.left, 0, e)}px round ${rad}px ${rad}px ${foot}px ${foot}px)`;
}

export default function Hero({ locale }) {
  const t = getDict(locale).hero;
  const ref = useRef(null);
  const stage = useRef(null);
  const dims = useRef(null);
  const reduce = useReducedMotion();
  const resized = useMotionValue(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useEffect(() => {
    const set = () => {
      const el = stage.current;
      if (!el) return;
      dims.current = { vw: el.clientWidth, vh: el.clientHeight };
      resized.set(resized.get() + 1);
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(stage.current);
    return () => ro.disconnect();
  }, [resized]);

  // Sous « réduire les animations », l'arche reste fixe et lisible
  const open = useTransform(scrollYProgress, [0, 0.62], reduce ? [0, 0] : [0, 1], { clamp: true });
  // Tant que la scène n'est pas mesurée, on laisse le CSS dessiner l'arche
  const clip = useTransform([open, resized], ([o]) => (dims.current ? archClip(dims.current.vw, dims.current.vh, o) : undefined));
  const imgScale = useTransform(open, [0, 1], reduce ? [1, 1] : [1.35, 1]);
  const copyOpacity = useTransform(scrollYProgress, [0.04, 0.3], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const overOpacity = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const overY = useTransform(scrollYProgress, [0.55, 0.8], [60, 0]);

  return (
    <section className={`hero ${reduce ? "is-still" : ""}`} ref={ref} aria-labelledby="hero-title">
      <div className="hero-stage" ref={stage}>
        <motion.div className="hero-arch" style={{ clipPath: clip }}>
          <motion.div className="hero-img" style={{ scale: imgScale }}>
            <Image
              src={HERO_IMG}
              alt={locale === "fr" ? "Surfeur dans une vague de l’Atlantique" : "Surfer riding an Atlantic wave"}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 759px) 100vw, 100vw"
            />
          </motion.div>
        </motion.div>

        <motion.div className="hero-copy" style={reduce ? undefined : { opacity: copyOpacity, y: copyY }}>
          <h1 className="display hero-title" id="hero-title">
            <span>
              <span style={{ "--i": 0 }}>{t.l1}</span>
            </span>
            <span>
              <span style={{ "--i": 1 }}>{t.l2}</span>
            </span>
          </h1>
          <div className="hero-row">
            <p>{t.sub}</p>
            <a href={`/${locale}#reserver`} className="btn">
              {t.cta}
            </a>
          </div>
        </motion.div>

        <motion.div className="hero-over" style={{ opacity: reduce ? 0 : overOpacity }} aria-hidden="true">
          <motion.p style={{ y: overY }}>{t.over}</motion.p>
        </motion.div>

        <motion.span className="hero-cue" style={{ opacity: copyOpacity }} aria-hidden="true">
          {t.scroll}
        </motion.span>
      </div>
    </section>
  );
}
