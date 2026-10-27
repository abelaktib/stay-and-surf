import { STAY } from "./config";

/* Dates manipulées en chaînes ISO "YYYY-MM-DD", calculs en UTC pour éviter les décalages horaires. */

export const parseISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
export const toISO = (d) => d.toISOString().slice(0, 10);
export const addDays = (iso, n) => {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
};
export const nightsBetween = (a, b) =>
  Math.round((parseISO(b) - parseISO(a)) / 86400000);

/** Liste des nuits [checkIn, checkOut) */
export function nightsOf(checkIn, checkOut) {
  const out = [];
  for (let d = checkIn; d < checkOut; d = addDays(d, 1)) out.push(d);
  return out;
}

function inRange(md, from, to) {
  return from <= to ? md >= from && md <= to : md >= from || md <= to;
}

export function weeklyRateFor(iso) {
  const md = iso.slice(5);
  const s = STAY.seasons.find((x) => inRange(md, x.from, x.to));
  return s ? s.weeklyPricePerPerson : STAY.weeklyPricePerPerson;
}

/**
 * Prix total en euros (arrondi à l'euro) pour un groupe.
 * Renvoie aussi le détail utile à l'affichage.
 */
export function quote(checkIn, checkOut, guests) {
  const nights = nightsOf(checkIn, checkOut);
  const perPerson = nights.reduce((sum, n) => sum + weeklyRateFor(n) / 7, 0);
  const perPersonRounded = Math.round(perPerson);
  const total = perPersonRounded * guests;
  const dueNow = Math.round(total * STAY.depositRate);
  return {
    nights: nights.length,
    guests,
    perPerson: perPersonRounded,
    total,
    dueNow,
    dueLater: total - dueNow,
  };
}

/** Contrôle d'une demande : renvoie un code d'erreur ou null */
export function validateStay({ checkIn, checkOut, guests }, blockedSet, today) {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso.test(checkIn || "") || !iso.test(checkOut || "")) return "dates";
  if (checkIn < today) return "past";
  const n = nightsBetween(checkIn, checkOut);
  if (n < STAY.minNights) return "minNights";
  if (n > 60) return "maxNights";
  const g = Number(guests);
  if (!Number.isInteger(g) || g < 1 || g > STAY.maxGuests) return "guests";
  if (nightsOf(checkIn, checkOut).some((d) => blockedSet.has(d))) return "unavailable";
  return null;
}
