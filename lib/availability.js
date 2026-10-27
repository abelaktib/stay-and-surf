import "server-only";
import Stripe from "stripe";
import { STAY } from "./config";
import { addDays, nightsOf, toISO, isISODate } from "./pricing";
import { parseICS } from "./ical";

export const APP_TAG = "dar-nejma";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { maxNetworkRetries: 2, timeout: 15000 })
  : null;

/* Plages réellement réservées relevées sur Booking (avril 2026).
   Utilisées uniquement tant qu'aucun flux iCal n'est configuré, pour la démo. */
const DEMO_EVENTS = [
  { start: "2026-10-22", end: "2026-10-29" },
  { start: "2027-01-18", end: "2027-04-24" },
];

/** Lit un flux iCal. Renvoie null en cas d'échec, pour ne jamais traiter une panne comme « tout est libre ». */
async function fetchFeed(url) {
  try {
    const res = await fetch(url, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "text/calendar" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const events = parseICS(await res.text());
    if (!events) throw new Error("réponse qui n'est pas un calendrier");
    return events;
  } catch (e) {
    // L'URL contient un jeton privé : on ne journalise que l'hôte
    let host = "?";
    try {
      host = new URL(url).host;
    } catch {}
    console.error(`[ical] flux indisponible (${host}) :`, e.message);
    return null;
  }
}

/** Réservations faites sur le site, lues directement dans Stripe (pas de base de données). */
export async function siteBookings() {
  if (!stripe) return [];
  const out = [];
  const since = Math.floor(Date.now() / 1000) - 400 * 86400;
  const holdLimit = Date.now() / 1000 - STAY.holdMinutes * 60 - 300;
  for await (const s of stripe.checkout.sessions.list({ limit: 100, created: { gte: since } })) {
    if (s.metadata?.app !== APP_TAG) continue;
    const paid = s.payment_status === "paid";
    const pending = s.status === "open" && s.created > holdLimit;
    if (!paid && !pending) continue;
    if (!isISODate(s.metadata.checkIn) || !isISODate(s.metadata.checkOut)) continue;
    out.push({ start: s.metadata.checkIn, end: s.metadata.checkOut, id: s.id, paid, created: s.created });
  }
  return out;
}

/**
 * Nuits indisponibles (chaînes ISO).
 * `degraded` passe à true si un flux Airbnb/Booking ou Stripe n'a pas répondu :
 * l'affichage reste possible, mais le paiement est refusé pour éviter une double réservation.
 */
export async function getBlockedNights() {
  const feeds = [process.env.AIRBNB_ICAL_URL, process.env.BOOKING_ICAL_URL].filter(Boolean);
  let degraded = false;
  let external = DEMO_EVENTS;
  if (feeds.length) {
    const results = await Promise.all(feeds.map(fetchFeed));
    degraded = results.some((r) => r === null);
    external = results.filter(Boolean).flat();
  }
  const internal = await siteBookings().catch((e) => {
    console.error("[stripe] lecture des réservations impossible :", e.message);
    degraded = true;
    return [];
  });
  const today = toISO(new Date());
  const horizon = addDays(today, 620);
  const set = new Set();
  for (const ev of [...external, ...internal]) {
    const from = ev.start > today ? ev.start : today;
    const to = ev.end < horizon ? ev.end : horizon;
    for (const n of nightsOf(from, to)) set.add(n);
  }
  return { blocked: set, demo: feeds.length === 0, degraded, openHolds: internal.filter((b) => !b.paid).length };
}
