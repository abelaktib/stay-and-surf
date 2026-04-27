"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowUpRight,
  MapPin,
  Menu,
  X,
  Waves,
  Wind,
  Sun,
  Plus,
  Minus,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────
   STAY & SURF — Oualidia, Morocco
   ────────────────────────────────────────────────────────── */

// URLs des plateformes (utilisées pour les deep-links)
const BOOKING_URL =
  "https://www.booking.com/hotel/ma/darnejma-oualidia.fr.html";
const AIRBNB_URL = "https://www.airbnb.fr/rooms/00000000"; // TODO

const IMG = {
  heroWave:
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=2400&q=80",
  surferSunset:
    "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=1800&q=80",
  moroccoCoast:
    "https://images.unsplash.com/photo-1531592937781-344ad608fabf?auto=format&fit=crop&w=1800&q=80",
  berberDoor:
    "https://images.unsplash.com/photo-1553603227-2358aabe821e?auto=format&fit=crop&w=1400&q=80",
  pool:
    "https://stayandsurf.com/wp-content/uploads/2025/06/WhatsApp-Image-2025-06-27-at-23.07.58-2.jpeg",
  room:
    "https://stayandsurf.com/wp-content/uploads/2025/06/WhatsApp-Image-2025-06-23-at-20.36.40.jpeg",
  terrace:
    "https://stayandsurf.com/wp-content/uploads/2025/06/WhatsApp-Image-2025-06-26-at-13.52.01.jpeg",
  oualidiaLagoon:
    "https://stayandsurf.com/wp-content/uploads/2025/06/oualidia-plage-cheval.webp",
  foodTajine:
    "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=1400&q=80",
  quadDesert:
    "https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?auto=format&fit=crop&w=1400&q=80",
};

/* ─────────────────── PRIMITIVES ─────────────────── */

const Reveal = ({ children, delay = 0, y = 32, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const SplitLine = ({ text, className = "", delay = 0 }) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 1.1,
              delay: delay + i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {w}
            {i < words.length - 1 && "\u00A0"}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

/* ─────────────────── NAV ─────────────────── */

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    ["Séjours", "#sejours"],
    ["Dar Nejma", "#dar-nejma"],
    ["Le Spot", "#spot"],
    ["Activités", "#activites"],
    ["Contact", "#contact"],
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          scrolled ? "bg-ivory/85 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2">
            <span className="font-display italic-display text-[22px] leading-none text-ink">
              stay<span className="text-terracotta">&amp;</span>surf
            </span>
            <span className="tracker text-ink/60 hidden md:inline">
              · Oualidia
            </span>
          </a>

          <div className="hidden md:flex items-center gap-9">
            {links.map(([l, href]) => (
              <a
                key={l}
                href={href}
                className="tracker-tight text-ink hover:text-terracotta transition-colors"
              >
                {l}
              </a>
            ))}
          </div>

          <a
            href="#reserver"
            className="hidden md:flex items-center gap-2 bg-ink text-ivory px-5 py-2.5 rounded-full tracker-tight hover:bg-terracotta transition-colors"
          >
            Réserver <ArrowUpRight size={14} />
          </a>

          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-ink"
            aria-label="Menu"
          >
            <Menu />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink text-ivory flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <span className="font-display italic-display text-[22px]">
                stay<span className="text-terracotta">&amp;</span>surf
              </span>
              <button onClick={() => setOpen(false)} aria-label="Fermer">
                <X />
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center px-8 gap-6">
              {links.map(([l, href], i) => (
                <motion.a
                  key={l}
                  href={href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="font-display italic-display text-5xl"
                >
                  {l}
                </motion.a>
              ))}
              <a
                href="#reserver"
                onClick={() => setOpen(false)}
                className="mt-6 inline-flex self-start bg-terracotta text-ivory px-6 py-3 rounded-full tracker-tight"
              >
                Réserver maintenant
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ─────────────────── HERO ─────────────────── */

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative h-[100svh] min-h-[640px] overflow-hidden bg-ink text-ivory"
    >
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={IMG.heroWave}
          alt="Vague atlantique au Maroc"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/10 to-ink/80" />
      </motion.div>

      <motion.div
        style={{ opacity: fade }}
        className="relative z-10 h-full flex flex-col justify-between px-6 md:px-10 pt-28 pb-10 max-w-[1400px] mx-auto"
      >
        <div className="flex justify-between items-start">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="tracker text-ivory/70"
          >
            N° 24 · La perle de l&apos;Atlantique
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="tracker text-ivory/70 hidden md:block"
          >
            32°44′N 9°02′W
          </motion.span>
        </div>

        <div className="flex-1 flex items-center">
          <h1 className="font-display text-[clamp(3rem,10.5vw,11rem)] leading-[0.92] font-light tracking-[-0.02em]">
            <SplitLine text="Surfez la côte" delay={0.2} />
            <br />
            <span className="italic-display text-terracotta">
              <SplitLine text="sauvage" delay={0.5} />
            </span>{" "}
            <SplitLine text="du Maroc." delay={0.7} />
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <p className="max-w-md text-ivory/85 leading-relaxed">
            Une maison d&apos;hôtes marocaine face à l&apos;océan, des vagues
            pour tous niveaux, et la lagune d&apos;Oualidia à vingt minutes de
            la planche.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#reserver"
              className="inline-flex items-center gap-3 bg-ivory text-ink px-7 py-4 rounded-full tracker-tight hover:bg-terracotta hover:text-ivory transition-colors"
            >
              Réserver le séjour <ArrowUpRight size={16} />
            </a>
            <a
              href="#sejours"
              className="tracker-tight text-ivory underline underline-offset-8 decoration-ivory/40 hover:decoration-terracotta"
            >
              Voir les formules
            </a>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-ivory/60"
        />
      </motion.div>
    </section>
  );
};

/* ─────────────────── MARQUEE ─────────────────── */

const Marquee = () => {
  const items = [
    "Oualidia", "—", "Atlantique", "—", "Surf pour tous niveaux", "—",
    "Maison d'hôtes", "—", "Lagune préservée", "—", "Piscine privée",
    "—", "Pension complète",
  ];
  return (
    <div className="bg-ink text-ivory py-4 overflow-hidden border-y border-ivory/10">
      <div className="flex gap-10 marquee-track whitespace-nowrap">
        {[...items, ...items, ...items].map((i, k) => (
          <span
            key={k}
            className="font-display italic-display text-2xl md:text-3xl"
          >
            {i}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────── MANIFESTO ─────────────────── */

const Manifesto = () => (
  <section className="bg-ivory text-ink py-28 md:py-40 px-6 md:px-10">
    <div className="max-w-[1400px] mx-auto grid md:grid-cols-12 gap-12">
      <Reveal className="md:col-span-3">
        <span className="tracker text-ink/60">01 — Le manifeste</span>
      </Reveal>
      <div className="md:col-span-9">
        <Reveal>
          <h2 className="font-display text-[clamp(2rem,5vw,4.5rem)] leading-[1.02] font-light tracking-[-0.015em]">
            On ne vend pas des nuitées.{" "}
            <span className="italic-display text-terracotta">
              On vend le bruit des vagues
            </span>{" "}
            qui remplace la sonnerie du réveil, l&apos;odeur du pain chaud le
            matin, la sensation d&apos;une planche neuve sous les pieds.
          </h2>
        </Reveal>
        <Reveal delay={0.2} className="mt-12 grid md:grid-cols-2 gap-10 max-w-4xl">
          <p className="text-ink/80 leading-relaxed text-lg">
            Dar Nejma, c&apos;est une maison construite à la main, à cinq
            minutes des spots d&apos;Oualidia. Quatre personnes maximum, une
            piscine qui prend le soleil toute la journée, une cuisine où
            l&apos;on partage.
          </p>
          <p className="text-ink/80 leading-relaxed text-lg">
            Les séjours s&apos;organisent autour du surf, mais on garde la place
            pour le reste : balades en quad dans les dunes, tajines à la tombée
            du jour, nuits sous un ciel sans lumières.
          </p>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ─────────────────── STATS ─────────────────── */

const Counter = ({ target, suffix = "", duration = 1.8 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
};

const Stats = () => {
  const stats = [
    { n: 400, s: "m", label: "de l'océan à la maison" },
    { n: 6, s: "", label: "spots de surf à moins de 20 min" },
    { n: 4, s: "", label: "voyageurs maximum" },
    { n: 320, s: "", label: "jours de soleil par an" },
  ];
  return (
    <section className="bg-ink text-ivory py-24 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-4 gap-12">
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="border-t border-ivory/20 pt-6">
              <div className="font-display text-7xl md:text-8xl font-light tracking-[-0.03em]">
                <Counter target={s.n} suffix={s.s} />
              </div>
              <p className="mt-4 tracker-tight text-ivory/70">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ─────────────────── DAR NEJMA ─────────────────── */

const DarNejma = () => (
  <section
    id="dar-nejma"
    className="bg-ivory text-ink py-28 md:py-40 px-6 md:px-10"
  >
    <div className="max-w-[1400px] mx-auto">
      <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end mb-16">
        <Reveal className="md:col-span-3">
          <span className="tracker text-ink/60">02 — L&apos;hébergement</span>
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-9">
          <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] leading-[0.95] font-light tracking-[-0.02em]">
            Dar <span className="italic-display text-terracotta">Nejma</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-ink/75">
            Quatre-vingts mètres carrés, une piscine privée, une terrasse qui
            regarde le coucher du soleil. Conçue pour quatre personnes.
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <Reveal className="col-span-12 md:col-span-8 grain rounded-sm overflow-hidden">
          <div className="aspect-[16/10] relative">
            <img
              src={IMG.pool}
              alt="Piscine Dar Nejma"
              className="w-full h-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1} className="col-span-6 md:col-span-4 grain rounded-sm overflow-hidden">
          <div className="aspect-[4/5] relative">
            <img src={IMG.room} alt="Chambre" className="w-full h-full object-cover" />
          </div>
        </Reveal>
        <Reveal delay={0.15} className="col-span-6 md:col-span-4 grain rounded-sm overflow-hidden md:translate-y-8">
          <div className="aspect-[4/5] relative">
            <img src={IMG.terrace} alt="Terrasse" className="w-full h-full object-cover" />
          </div>
        </Reveal>
        <Reveal delay={0.2} className="col-span-12 md:col-span-7 grain rounded-sm overflow-hidden md:translate-y-4">
          <div className="aspect-[16/9] relative">
            <img src={IMG.berberDoor} alt="Architecture marocaine" className="w-full h-full object-cover" />
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-16 md:mt-24 grid md:grid-cols-4 gap-8 border-t border-ink/15 pt-10">
          {[
            ["Capacité", "1 — 4 voyageurs"],
            ["Surface", "80 m²"],
            ["Piscine", "Privée, chauffée"],
            ["Pension", "Petit-déj + dîner inclus"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="tracker-tight text-ink/60">{k}</p>
              <p className="font-display text-2xl mt-2">{v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-12 flex flex-wrap gap-4 items-center">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-6xl">80</span>
            <span className="font-display italic-display text-2xl text-ink/60">
              €/ nuit
            </span>
          </div>
          <a
            href="#reserver"
            className="ml-auto inline-flex items-center gap-2 bg-ink text-ivory px-6 py-3 rounded-full tracker-tight hover:bg-terracotta transition-colors"
          >
            Vérifier les disponibilités <ArrowUpRight size={14} />
          </a>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ─────────────────── LE SPOT ─────────────────── */

const TheSpot = () => (
  <section
    id="spot"
    className="relative text-ivory py-28 md:py-40 px-6 md:px-10 overflow-hidden"
    style={{ background: "var(--ink-soft)" }}
  >
    <div className="absolute inset-0 opacity-30">
      <img src={IMG.oualidiaLagoon} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
    </div>

    <div className="relative max-w-[1400px] mx-auto grid md:grid-cols-12 gap-12 items-center">
      <div className="md:col-span-6">
        <Reveal>
          <span className="tracker text-ivory/60">03 — Le spot</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-6 font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] font-light tracking-[-0.02em]">
            Oualidia,{" "}
            <span className="italic-display text-seafoam">
              là où l&apos;Atlantique
            </span>
            <br />
            devient indulgent.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-xl text-ivory/80 leading-relaxed text-lg">
            Entre Casablanca et Essaouira, une lagune protégée à l&apos;eau
            turquoise. Des vagues longues et régulières pour apprendre, des
            reefs puissants pour progresser. Moins connue qu&apos;Agadir ou
            Taghazout — et c&apos;est bien pour ça qu&apos;on y reste.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { icon: Waves, t: "Beach breaks", s: "pour débutants" },
              { icon: Wind, t: "Reef breaks", s: "intermédiaires" },
              { icon: Sun, t: "Sept. — Mai", s: "saison idéale" },
            ].map(({ icon: Icon, t, s }, i) => (
              <div key={i} className="border-t border-ivory/25 pt-4">
                <Icon size={22} className="text-seafoam" strokeWidth={1.3} />
                <p className="mt-3 font-display text-lg">{t}</p>
                <p className="tracker-tight text-ivory/60">{s}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="md:col-span-6 relative">
        <Reveal delay={0.2}>
          <div className="relative aspect-[4/5] grain rounded-sm overflow-hidden">
            <img src={IMG.surferSunset} alt="" className="w-full h-full object-cover" />
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-ivory">
              <div>
                <p className="tracker text-ivory/70">Coordonnées</p>
                <p className="font-display italic-display text-2xl">
                  32°44′N · 9°02′W
                </p>
              </div>
              <MapPin size={28} strokeWidth={1.2} />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ─────────────────── SEJOURS ─────────────────── */

const Sejours = () => {
  const packs = [
    {
      tag: "Formule signature",
      name: "Surf & Quad",
      desc: "Sept jours tout inclus. Cinq sessions de surf encadrées, une sortie quad dans les dunes, transfert aéroport de Casablanca, pension complète.",
      price: "100",
      per: "€ / nuit",
      bullets: [
        "Transfert aéroport Casablanca",
        "Cinq sessions de surf coachées",
        "Sortie quad au coucher du soleil",
        "Petit-déjeuner + dîner inclus",
      ],
      accent: "terracotta",
    },
    {
      tag: "Formule essentiel",
      name: "Stay at Dar Nejma",
      desc: "La formule hébergement seule. Vous venez avec votre planche, on s'occupe du reste — les clefs, la piscine, le dîner sur la terrasse.",
      price: "80",
      per: "€ / nuit",
      bullets: [
        "Maison privée 80 m²",
        "Piscine privée",
        "Petit-déjeuner + dîner inclus",
        "Conciergerie sur demande",
      ],
      accent: "seafoam",
    },
  ];

  return (
    <section
      id="sejours"
      className="bg-ivory text-ink py-28 md:py-40 px-6 md:px-10"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-8 mb-16">
          <Reveal className="md:col-span-3">
            <span className="tracker text-ink/60">04 — Les séjours</span>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-9">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] font-light tracking-[-0.02em]">
              Deux façons de{" "}
              <span className="italic-display text-terracotta">
                venir chez nous.
              </span>
            </h2>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          {packs.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4 }}
                className="relative p-8 md:p-10 rounded-sm border border-ink/15 h-full flex flex-col"
                style={{ background: "var(--ivory-deep)" }}
              >
                <span className="tracker-tight text-ink/60">{p.tag}</span>
                <h3 className="mt-4 font-display text-4xl md:text-5xl font-light">
                  {p.name.split(" ").slice(0, -1).join(" ")}{" "}
                  <span
                    className="italic-display"
                    style={{
                      color:
                        p.accent === "terracotta"
                          ? "var(--terracotta)"
                          : "var(--seafoam)",
                    }}
                  >
                    {p.name.split(" ").slice(-1)}
                  </span>
                </h3>
                <p className="mt-4 text-ink/75 leading-relaxed">{p.desc}</p>
                <ul className="mt-8 space-y-3">
                  {p.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 text-ink/85"
                    >
                      <span
                        className="mt-2 w-1 h-1 rounded-full shrink-0"
                        style={{
                          background:
                            p.accent === "terracotta"
                              ? "var(--terracotta)"
                              : "var(--seafoam)",
                        }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10 pt-6 border-t border-ink/15 flex items-end justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl">{p.price}</span>
                    <span className="font-display italic-display text-lg text-ink/60">
                      {p.per}
                    </span>
                  </div>
                  <a
                    href="#reserver"
                    className="inline-flex items-center gap-2 tracker-tight hover:text-terracotta"
                  >
                    Réserver <ArrowUpRight size={14} />
                  </a>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────── ACTIVITES ─────────────────── */

const Activites = () => {
  const items = [
    { t: "Surf", s: "Cours privés ou en petit groupe, tous niveaux, planches et combis fournies.", img: IMG.surferSunset },
    { t: "Quad", s: "Une heure dans les dunes, au coucher du soleil — l'une des seules façons d'avoir les dunes pour soi.", img: IMG.quadDesert },
    { t: "Gastronomie", s: "Tajines préparés à la maison, pain frais, dîners sur la terrasse.", img: IMG.foodTajine },
    { t: "Culture", s: "Médinas, artisanat, marché de Oualidia le dimanche matin.", img: IMG.moroccoCoast },
  ];

  return (
    <section
      id="activites"
      className="bg-ivory text-ink py-28 md:py-40 px-6 md:px-10"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-8 mb-16">
          <Reveal className="md:col-span-3">
            <span className="tracker text-ink/60">05 — Au-delà des vagues</span>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-9">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] font-light tracking-[-0.02em]">
              Le surf, puis{" "}
              <span className="italic-display text-terracotta">
                tout le reste.
              </span>
            </h2>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {items.map((it, i) => (
            <Reveal key={it.t} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4 }}
                className="group"
              >
                <div className="grain rounded-sm overflow-hidden aspect-[4/5] mb-4">
                  <motion.img
                    src={it.img}
                    alt={it.t}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <h3 className="font-display italic-display text-3xl text-ink group-hover:text-terracotta transition-colors">
                  {it.t}
                </h3>
                <p className="mt-2 text-ink/70 text-sm leading-relaxed">
                  {it.s}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────── TESTIMONIAL ─────────────────── */

const Testimonial = () => (
  <section className="bg-ink text-ivory py-28 md:py-40 px-6 md:px-10">
    <div className="max-w-[1100px] mx-auto text-center">
      <Reveal>
        <div className="flex justify-center gap-1 mb-10">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} className="fill-gold text-gold" />
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <blockquote className="font-display text-[clamp(1.75rem,3.5vw,3rem)] leading-[1.15] font-light">
          «{" "}
          <span className="italic-display">
            On est arrivés pour cinq jours, on est repartis après dix.
          </span>{" "}
          La maison est belle, l&apos;océan est à la porte, et on oublie
          complètement l&apos;idée de rentrer. »
        </blockquote>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="mt-10 tracker">— Camille &amp; Théo · Booking, 5★</div>
      </Reveal>
    </div>
  </section>
);

/* ─────────────────── RESERVATION — Calendrier ─────────────────── */

const FR_DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const FR_MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const sameDay = (a, b) =>
  a && b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const fmtISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const fmtPretty = (d) =>
  d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

const MonthGrid = ({
  viewDate, checkIn, checkOut, blockedSet, onPick, hovered, setHovered,
}) => {
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const firstDay = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const startIdx = (firstDay.getDay() + 6) % 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isBlocked = (d) => blockedSet.has(fmtISO(d));
  const isPast = (d) => d < today;

  const cells = [];
  for (let i = 0; i < startIdx; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));

  return (
    <div>
      <h3 className="font-display italic-display text-2xl mb-4 tracking-[-0.01em]">
        {FR_MONTHS[m]}{" "}
        <span className="text-ink/40 not-italic font-display">{y}</span>
      </h3>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {FR_DAYS.map((d, i) => (
          <div key={i} className="tracker-tight text-ink/40 text-center py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const past = isPast(date);
          const blocked = isBlocked(date);
          const disabled = past || blocked;
          const isCheckIn = sameDay(date, checkIn);
          const isCheckOut = sameDay(date, checkOut);
          const endPoint =
            checkOut || (checkIn && hovered && hovered > checkIn ? hovered : null);
          const inRange =
            checkIn && endPoint && date > checkIn && date < endPoint && !blocked;

          return (
            <button
              key={i}
              onClick={() => !disabled && onPick(date)}
              onMouseEnter={() => !disabled && setHovered(date)}
              disabled={disabled}
              className={[
                "aspect-square flex items-center justify-center text-[15px] transition-all relative",
                disabled
                  ? "text-ink/25 cursor-not-allowed"
                  : "cursor-pointer hover:bg-ink/5",
                isCheckIn || isCheckOut
                  ? "!bg-terracotta text-ivory font-medium rounded-full z-10"
                  : "",
                inRange ? "bg-terracotta/15" : "",
              ].join(" ")}
            >
              <span className="relative z-10">{date.getDate()}</span>
              {blocked && !past && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="block w-5 h-px bg-ink/40 rotate-[-30deg]" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Reserver = () => {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [guests, setGuests] = useState(2);
  const [formula, setFormula] = useState("stay");
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch des vraies dispos depuis l'API
  useEffect(() => {
    let cancelled = false;
    fetch("/api/availability")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setBlockedDates(data.blocked || []);
          setLoading(false);
        }
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const handlePick = (date) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
      return;
    }
    if (date <= checkIn) {
      setCheckIn(date);
      setCheckOut(null);
      return;
    }
    // Conflit avec une date bloquée entre checkIn et date ?
    const cursor = new Date(checkIn);
    cursor.setDate(cursor.getDate() + 1);
    let conflict = false;
    while (cursor < date) {
      if (blockedSet.has(fmtISO(cursor))) {
        conflict = true;
        break;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    if (conflict) {
      setCheckIn(date);
      setCheckOut(null);
    } else {
      setCheckOut(date);
    }
  };

  const nights =
    checkIn && checkOut ? Math.round((checkOut - checkIn) / 86400000) : 0;
  const pricePerNight = formula === "surf" ? 100 : 80;
  const total = nights * pricePerNight;

  const deepLinks = useMemo(() => {
    if (!checkIn || !checkOut) {
      return { booking: BOOKING_URL, airbnb: AIRBNB_URL };
    }
    return {
      booking: `${BOOKING_URL}?checkin=${fmtISO(checkIn)}&checkout=${fmtISO(
        checkOut
      )}&group_adults=${guests}&no_rooms=1`,
      airbnb: `${AIRBNB_URL}?check_in=${fmtISO(checkIn)}&check_out=${fmtISO(
        checkOut
      )}&adults=${guests}`,
    };
  }, [checkIn, checkOut, guests]);

  const mailtoLink = (() => {
    const subject = encodeURIComponent("Demande de réservation — Dar Nejma");
    const body = encodeURIComponent(
      `Bonjour,

Je souhaite réserver un séjour à Dar Nejma :

• Formule : ${formula === "surf" ? "Surf & Quad (100€/nuit)" : "Stay at Dar Nejma (80€/nuit)"}
• Arrivée : ${checkIn ? fmtPretty(checkIn) : "à préciser"}
• Départ : ${checkOut ? fmtPretty(checkOut) : "à préciser"}
• Voyageurs : ${guests}${nights > 0 ? `
• Total estimé : ${total} €` : ""}

Merci !`
    );
    return `mailto:contact@stayandsurf.com?subject=${subject}&body=${body}`;
  })();

  const hasDates = nights > 0;
  const monthA = viewMonth;
  const monthB = addMonths(viewMonth, 1);

  return (
    <section id="reserver" className="bg-ivory text-ink py-28 md:py-40 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-12 gap-8 mb-16">
          <Reveal className="md:col-span-3">
            <span className="tracker text-ink/60">06 — Réserver</span>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-9">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] font-light tracking-[-0.02em]">
              Choisissez vos{" "}
              <span className="italic-display text-terracotta">dates.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg text-ink/75">
              Calendrier synchronisé avec Booking et Airbnb. La réservation se
              finalise sur la plateforme de votre choix.
            </p>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-10">
          <Reveal className="lg:col-span-3">
            <div
              className="border border-ink/15 rounded-sm p-6 md:p-10"
              style={{ background: "var(--ivory-deep)" }}
            >
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                  className="p-2 rounded-full hover:bg-ink/10 transition-colors"
                  aria-label="Mois précédent"
                >
                  <ChevronLeft size={18} strokeWidth={1.5} />
                </button>
                <span className="tracker text-ink/60">
                  {loading ? "Chargement des dispos…" : "Disponibilités en temps réel"}
                </span>
                <button
                  onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                  className="p-2 rounded-full hover:bg-ink/10 transition-colors"
                  aria-label="Mois suivant"
                >
                  <ChevronRight size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div
                className="grid md:grid-cols-2 gap-10"
                onMouseLeave={() => setHovered(null)}
              >
                <MonthGrid
                  viewDate={monthA}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  blockedSet={blockedSet}
                  onPick={handlePick}
                  hovered={hovered}
                  setHovered={setHovered}
                />
                <div className="hidden md:block">
                  <MonthGrid
                    viewDate={monthB}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    blockedSet={blockedSet}
                    onPick={handlePick}
                    hovered={hovered}
                    setHovered={setHovered}
                  />
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-ink/10 flex flex-wrap gap-x-8 gap-y-3 tracker-tight text-ink/60">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-terracotta" />
                  Sélectionné
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-terracotta/20" />
                  Séjour
                </span>
                <span className="flex items-center gap-2">
                  <span className="relative w-3 h-3">
                    <span className="absolute inset-0 bg-ink/10 rounded-sm" />
                    <span className="absolute top-1/2 left-0 right-0 h-px bg-ink/40 rotate-[-30deg]" />
                  </span>
                  Indisponible
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-2">
            <div className="lg:sticky lg:top-28 bg-ink text-ivory rounded-sm p-6 md:p-8">
              <p className="tracker text-ivory/60">Votre séjour</p>

              <div className="mt-6">
                <p className="tracker-tight text-ivory/60 mb-3">Formule</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["stay", "Stay", "80€/nuit"],
                    ["surf", "Surf & Quad", "100€/nuit"],
                  ].map(([key, label, price]) => (
                    <button
                      key={key}
                      onClick={() => setFormula(key)}
                      className={`p-3 rounded-sm text-left transition-all ${
                        formula === key
                          ? "bg-ivory text-ink"
                          : "border border-ivory/25 hover:border-ivory/60"
                      }`}
                    >
                      <div className="font-display italic-display text-lg leading-tight">
                        {label}
                      </div>
                      <div className="tracker-tight opacity-70 mt-1">{price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="tracker-tight text-ivory/60 mb-3">Voyageurs</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-9 h-9 border border-ivory/30 rounded-full hover:bg-ivory/10 flex items-center justify-center transition-colors"
                    aria-label="Moins"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-display text-3xl w-10 text-center">
                    {guests}
                  </span>
                  <button
                    onClick={() => setGuests(Math.min(4, guests + 1))}
                    className="w-9 h-9 border border-ivory/30 rounded-full hover:bg-ivory/10 flex items-center justify-center transition-colors"
                    aria-label="Plus"
                  >
                    <Plus size={14} />
                  </button>
                  <span className="tracker-tight text-ivory/50 ml-auto">
                    max 4
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="border border-ivory/25 p-3 rounded-sm">
                  <p className="tracker-tight text-ivory/60">Arrivée</p>
                  <p className="font-display text-lg mt-1">
                    {checkIn ? fmtPretty(checkIn) : "—"}
                  </p>
                </div>
                <div className="border border-ivory/25 p-3 rounded-sm">
                  <p className="tracker-tight text-ivory/60">Départ</p>
                  <p className="font-display text-lg mt-1">
                    {checkOut ? fmtPretty(checkOut) : "—"}
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {hasDates && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-ivory/20 overflow-hidden"
                  >
                    <div className="flex justify-between text-ivory/70">
                      <span>
                        {nights} nuit{nights > 1 ? "s" : ""} × {pricePerNight}€
                      </span>
                      <span>{total}€</span>
                    </div>
                    <div className="mt-4 flex justify-between items-baseline">
                      <span className="tracker text-ivory/60">
                        Total estimé
                      </span>
                      <span className="font-display text-5xl">
                        {total}
                        <span className="italic-display text-xl text-ivory/60 ml-1">
                          €
                        </span>
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 space-y-2">
                <a
                  href={deepLinks.booking}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!hasDates}
                  className={`flex items-center justify-between p-4 rounded-sm transition-all ${
                    hasDates
                      ? "bg-ivory text-ink hover:bg-terracotta hover:text-ivory"
                      : "bg-ivory/10 text-ivory/40 pointer-events-none"
                  }`}
                >
                  <span className="tracker-tight">Réserver sur Booking</span>
                  <ArrowUpRight size={16} />
                </a>
                <a
                  href={deepLinks.airbnb}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!hasDates}
                  className={`flex items-center justify-between p-4 rounded-sm border transition-all ${
                    hasDates
                      ? "border-ivory/30 hover:bg-ivory/10 hover:border-ivory/60"
                      : "border-ivory/10 text-ivory/40 pointer-events-none"
                  }`}
                >
                  <span className="tracker-tight">Réserver sur Airbnb</span>
                  <ArrowUpRight size={16} />
                </a>
                <a
                  href={mailtoLink}
                  className="flex items-center justify-between p-4 text-ivory/80 hover:text-terracotta transition-colors"
                >
                  <span className="tracker-tight">
                    Écrire en direct — sans commission
                  </span>
                  <ArrowUpRight size={16} />
                </a>
              </div>

              <p className="mt-6 tracker-tight text-ivory/45 leading-relaxed">
                La réservation se finalise sur la plateforme choisie. Les dates
                barrées sont déjà réservées.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────── FOOTER ─────────────────── */

const Footer = () => (
  <footer
    id="contact"
    className="bg-ink text-ivory pt-20 pb-8 px-6 md:px-10"
  >
    <div className="max-w-[1400px] mx-auto">
      <Reveal>
        <h3 className="font-display text-[clamp(3rem,12vw,12rem)] leading-[0.9] font-light tracking-[-0.03em]">
          stay<span className="italic-display text-terracotta">&amp;</span>surf
        </h3>
      </Reveal>

      <div className="mt-16 grid md:grid-cols-4 gap-10 border-t border-ivory/20 pt-10">
        <div>
          <p className="tracker text-ivory/60">Écrivez</p>
          <a
            href="mailto:contact@stayandsurf.com"
            className="mt-3 block font-display text-xl hover:text-terracotta"
          >
            contact@stayandsurf.com
          </a>
        </div>
        <div>
          <p className="tracker text-ivory/60">Appelez</p>
          <a
            href="tel:+212528000000"
            className="mt-3 block font-display text-xl hover:text-terracotta"
          >
            +212 5 28 00 00 00
          </a>
        </div>
        <div>
          <p className="tracker text-ivory/60">Visitez</p>
          <p className="mt-3 font-display text-xl">
            Dr Njajra Ayir Safi<br />
            24252 Oualidia, Maroc
          </p>
        </div>
        <div>
          <p className="tracker text-ivory/60">Suivez</p>
          <div className="mt-3 flex gap-4">
            {["Instagram", "Booking", "Airbnb"].map((l) => (
              <a key={l} href="#" className="tracker-tight hover:text-terracotta">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 pt-6 border-t border-ivory/20 flex flex-col md:flex-row justify-between gap-4 tracker-tight text-ivory/60">
        <span>© 2026 Stay &amp; Surf · Oualidia, Maroc</span>
        <span>Conçu avec soin, face à l&apos;océan.</span>
      </div>
    </div>
  </footer>
);

/* ─────────────────── PAGE ─────────────────── */

export default function Page() {
  return (
    <main className="overflow-x-hidden">
      <Nav />
      <Hero />
      <Marquee />
      <Manifesto />
      <Stats />
      <DarNejma />
      <TheSpot />
      <Sejours />
      <Activites />
      <Testimonial />
      <Reserver />
      <Footer />
    </main>
  );
}
