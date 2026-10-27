"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getDict } from "@/lib/i18n";

// Rappel de réservation sur mobile : visible après le héros, masqué sur le calendrier
export default function StickyBook({ locale }) {
  const d = getDict(locale);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById("reserver");
    let bookingVisible = false;
    const update = () => setShow(window.scrollY > window.innerHeight * 1.4 && !bookingVisible);
    const io = new IntersectionObserver(([e]) => {
      bookingVisible = e.isIntersecting;
      update();
    });
    if (target) io.observe(target);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="sticky-book"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }}
          exit={{ y: 90, opacity: 0, transition: { duration: 0.2 } }}
        >
          <span>{d.book.sticky}</span>
          <a href={`/${locale}#reserver`} className="btn">
            {d.nav.book}
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
