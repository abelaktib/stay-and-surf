import Image from "next/image";
import { getDict } from "@/lib/i18n";

// Parallaxe en CSS pur (animation-timeline: view()), image fixe là où ce n'est pas géré
export default function Night({ locale }) {
  const text = getDict(locale).night;
  return (
    <section className="night">
      <div className="night-img">
        <Image
          src="/photos/rooftop-nuit.webp"
          alt={locale === "fr" ? "Le toit-terrasse de Dar Nejma la nuit, hamacs et guirlandes" : "Dar Nejma's rooftop at night with hammocks and string lights"}
          fill
          sizes="100vw"
        />
      </div>
      <p>{text}</p>
    </section>
  );
}
