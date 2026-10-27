"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { getDict } from "@/lib/i18n";

// Photos de chaque pièce : la première est celle de la carte
const PHOTOS = {
  salon: ["salon", "salon-lumiere", "salon-pompons", "salon-table", "salon-banquette"],
  "chambre-double-arche": ["chambre-double-arche", "chambre-double", "chambre-double-rose"],
  dortoir: ["dortoir"],
  "sdb-baignoire": ["sdb-baignoire", "sdb-vasque", "sdb-porte", "couloir-arches"],
  cuisine: ["cuisine"],
  "rooftop-jour": ["rooftop-jour", "rooftop-nuit", "facade-escalier"],
};

const CARD_RADIUS = "999px 999px 10px 10px";
const spring = { type: "spring", stiffness: 260, damping: 32, mass: 0.9 };

/**
 * Galerie des pièces : défilement horizontal piloté par le scroll sur grand écran,
 * carrousel natif au doigt sur mobile. Un clic ouvre la pièce en plein écran
 * (transition d'élément partagé de Framer Motion).
 */
export default function Rooms({ locale }) {
  const t = getDict(locale).house;
  const section = useRef(null);
  const track = useRef(null);
  const reduce = useReducedMotion();
  const [native, setNative] = useState(false);
  const [dist, setDist] = useState(0);
  const [open, setOpen] = useState(null); // index de la pièce ouverte

  useEffect(() => {
    const measure = () => {
      setNative(window.innerWidth < 760 || !!reduce);
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);

  return (
    <LayoutGroup>
      <div
        className={`rooms ${native ? "is-native" : ""}`}
        ref={section}
        style={{ height: native ? "auto" : `calc(100vh + ${dist}px)` }}
      >
        <div className="rooms-sticky">
          <motion.div className="rooms-track" ref={track} style={{ x: native ? 0 : x }}>
            {t.rooms.map((r, i) => (
              <RoomCard
                key={r.img}
                room={r}
                index={i}
                progress={scrollYProgress}
                native={native}
                hidden={open === i}
                label={`${t.view} : ${r.t}, ${PHOTOS[r.img].length} photos`}
                count={PHOTOS[r.img].length}
                onOpen={() => setOpen(i)}
              />
            ))}
          </motion.div>
          <div className="rooms-progress" aria-hidden="true">
            <motion.i style={{ scaleX: scrollYProgress }} />
          </div>
        </div>
        <p className="rooms-hint">{t.drag}</p>
      </div>

      <AnimatePresence>
        {open !== null && (
          <Lightbox key="lb" room={t.rooms[open]} t={t} onClose={() => setOpen(null)} />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}

function RoomCard({ room, index, progress, native, hidden, label, count, onOpen }) {
  // Léger parallaxe de l'image dans son arche
  const y = useTransform(progress, [0, 1], [index % 2 ? "-4%" : "4%", index % 2 ? "4%" : "-4%"]);
  return (
    <figure className="room">
      <button type="button" className="room-open" onClick={onOpen} aria-label={label}>
        <motion.div
          layoutId={`room-${room.img}`}
          className="arch"
          style={{ borderRadius: CARD_RADIUS, visibility: hidden ? "hidden" : "visible" }}
          transition={spring}
        >
          <motion.div style={{ position: "absolute", inset: "-6% 0", y: native ? 0 : y }}>
            <Image src={`/photos/${room.img}.webp`} alt={room.t} fill sizes="(max-width: 760px) 76vw, 32vw" />
          </motion.div>
          {count > 1 && <span className="room-count" aria-hidden="true">{count}</span>}
        </motion.div>
      </button>
      <figcaption>
        <h3>{room.t}</h3>
        <p>{room.d}</p>
      </figcaption>
    </figure>
  );
}

function Lightbox({ room, t, onClose }) {
  const photos = PHOTOS[room.img];
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const closeBtn = useRef(null);
  const box = useRef(null);

  const go = useCallback(
    (d) => {
      setDir(d);
      setI((v) => (v + d + photos.length) % photos.length);
    },
    [photos.length]
  );

  useEffect(() => {
    const prevFocus = document.activeElement;
    closeBtn.current?.focus();
    window.__lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      // Le focus reste dans la visionneuse
      if (e.key === "Tab" && box.current) {
        const items = [...box.current.querySelectorAll("button")];
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
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
      document.documentElement.style.overflow = "";
      prevFocus?.focus?.();
    };
  }, [go, onClose]);

  return (
    <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label={room.t} ref={box}>
      <motion.div
        className="lightbox-bg"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.25 } }}
      />
      <div className="lightbox-inner">
        <motion.div
          layoutId={`room-${room.img}`}
          className="lightbox-photo"
          style={{ borderRadius: 18 }}
          transition={spring}
        >
          {/* Image déjà en cache depuis la carte : affichée instantanément pendant le chargement HD */}
          <Image src={`/photos/${room.img}.webp`} alt="" fill sizes="(max-width: 760px) 76vw, 32vw" style={{ objectFit: "cover" }} aria-hidden="true" />
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={photos[i]}
              custom={dir}
              style={{ position: "absolute", inset: 0 }}
              initial={(d) => ({ x: `${d * 12}%`, opacity: 0 })}
              animate={{ x: 0, opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
              exit={(d) => ({ x: `${d * -12}%`, opacity: 0, transition: { duration: 0.3 } })}
              drag={photos.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                else if (info.offset.x > 60) go(-1);
              }}
            >
              <Image
                src={`/photos/${photos[i]}.webp`}
                alt={`${room.t}, ${t.photo(i + 1, photos.length)}`}
                fill
                sizes="(max-width: 900px) 100vw, 70vw"
                loading="eager"
                style={{ objectFit: "cover" }}
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="lightbox-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          <div>
            <h3>{room.t}</h3>
            <p>{room.d}</p>
          </div>
          <div className="lightbox-ctrl">
            {photos.length > 1 && (
              <>
                <span aria-live="polite">{t.photo(i + 1, photos.length)}</span>
                <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label={t.prevPhoto}>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
                </button>
                <button type="button" className="icon-btn" onClick={() => go(1)} aria-label={t.nextPhoto}>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
                </button>
              </>
            )}
            <button type="button" className="btn btn-light" onClick={onClose} ref={closeBtn}>
              {t.close}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
