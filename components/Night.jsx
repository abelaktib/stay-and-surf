"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { getDict } from "@/lib/i18n";

export default function Night({ locale }) {
  const text = getDict(locale).night;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const ty = useTransform(scrollYProgress, [0.2, 0.6], [80, 0]);

  return (
    <section className="night" ref={ref}>
      <motion.div style={{ position: "absolute", inset: "-10% 0", y }}>
        <Image
          src="/photos/rooftop-nuit.webp"
          alt={locale === "fr" ? "Le toit-terrasse de Dar Nejma la nuit, hamacs et guirlandes" : "Dar Nejma's rooftop at night with hammocks and string lights"}
          fill
          sizes="100vw"
        />
      </motion.div>
      <motion.p style={{ y: ty }}>{text}</motion.p>
    </section>
  );
}
