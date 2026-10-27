import Star from "./Star";
import { getDict } from "@/lib/i18n";

/**
 * Le texte se « remplit » mot à mot au défilement grâce aux animations CSS liées au scroll
 * (animation-timeline). Aucun JavaScript : les navigateurs qui ne les gèrent pas affichent
 * simplement le texte en entier. Les mots non révélés gardent un contraste lisible.
 */
export default function Intro({ locale }) {
  const text = getDict(locale).intro;
  const words = text.split(" ");
  return (
    <section className="intro">
      <div className="wrap intro-grid">
        <div className="intro-star-wrap" aria-hidden="true">
          <Star className="intro-star" />
        </div>
        <p className="intro-text" style={{ "--n": words.length }}>
          {words.map((w, i) => (
            <span key={i} className="w" style={{ "--k": i }}>
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
