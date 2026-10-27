/**
 * Validation des coordonnées envoyées par le formulaire de réservation.
 * Renvoie { error } ou { data } avec des valeurs nettoyées et bornées
 * (les métadonnées Stripe sont limitées à 500 caractères par valeur).
 */
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const clean = (v, max) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim().slice(0, max) : "";

export const LIMITS = { name: 120, email: 254, phone: 40, message: 450 };

export function validateContact(body) {
  if (!body || typeof body !== "object") return { error: "contact" };
  // Champ piège invisible : rempli uniquement par les robots
  if (typeof body.website === "string" && body.website.length > 0) return { error: "contact" };
  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email).toLowerCase();
  const phone = clean(body.phone, LIMITS.phone);
  const message = clean(body.message, LIMITS.message);
  if (name.length < 2 || !EMAIL.test(email)) return { error: "contact" };
  if (phone && !/^[+\d][\d\s().-]{5,}$/.test(phone)) return { error: "phone" };
  return { data: { name, email, phone, message } };
}

export const LOCALE_OK = (l) => (l === "en" ? "en" : "fr");
