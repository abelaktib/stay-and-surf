"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Star from "./Star";
import { getDict } from "@/lib/i18n";

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span className="w" style={{ opacity }}>
      {children}
    </motion.span>
  );
}

export default function Intro({ locale }) {
  const text = getDict(locale).intro;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = text.split(" ");
  const rotate = useTransform(scrollYProgress, [0, 1], [-60, 30]);

  return (
    <section className="intro" ref={ref}>
      <div className="wrap intro-grid">
        <motion.div style={{ rotate }}>
          <Star className="intro-star" />
        </motion.div>
        <p className="intro-text">
          <span className="sr-only">{text}</span>
          <span aria-hidden="true">
            {words.map((w, i) => {
              const start = i / words.length;
              return (
                <Word key={i} progress={scrollYProgress} range={[start, start + 1 / words.length]}>
                  {w + (i < words.length - 1 ? " " : "")}
                </Word>
              );
            })}
          </span>
        </p>
      </div>
    </section>
  );
}
