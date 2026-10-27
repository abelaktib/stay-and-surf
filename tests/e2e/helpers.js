import { readFileSync } from "node:fs";
import path from "node:path";

const photo = readFileSync(path.join(process.cwd(), "public/photos/rooftop-jour.webp"));

/**
 * Prépare une page de test : date figée, photo Unsplash remplacée par une photo locale
 * (tests hors ligne et reproductibles), collecte des erreurs console.
 */
export async function prepare(page, { blocked } = {}) {
  await page.clock.setFixedTime(new Date("2026-10-27T10:00:00"));
  await page.route(/_next\/image\?url=https%3A%2F%2Fimages\.unsplash\.com/, (r) =>
    r.fulfill({ status: 200, contentType: "image/webp", body: photo })
  );
  if (blocked) {
    await page.route("**/api/availability", (r) =>
      r.fulfill({ json: { blocked, demo: false, degraded: false } })
    );
  }
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  // Pas de voile d'ouverture pendant les tests
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("dn-intro", "1");
    } catch {}
  });
  return errors;
}
