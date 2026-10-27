import "server-only";
import Stripe from "stripe";
import { STAY } from "./config";
import { addDays, nightsOf, toISO } from "./pricing";

export const APP_TAG = "dar-nejma";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/* Plages réellement réservées relevées sur Booking (avril 2026).
   Utilisées uniquement tant qu'aucun flux iCal n'est configuré, pour la démo. */
const DEMO_EVENTS = [
  { start: "2026-10-22", end: "2026-10-29" },
  { start: "2027-01-18", end: "2027-04-24" },
];

function parseICS(text) {
  const events = [];
  // Déplie les lignes repliées (RFC 5545)
  const lines = text.replace(/\r\n[ \t]/g, "").replace(/\r\n/g, "\n").split("\n");
  let cur = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (line === "BEGIN:VEVENT") cur = {};
    else if (line === "END:VEVENT") {
      if (cur?.start) events.push({ start: cur.start, end: cur.end || addDays(cur.start, 1) });
      cur = null;
    } else if (cur) {
      const m = line.match(/^(DTSTART|DTEND)(?:;[^:]*)?:(\d{8})/i);
      if (m) {
        const v = m[2];
        cur[m[1].toUpperCase() === "DTSTART" ? "start" : "end"] =
          `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
      }
    }
  }
  return events;
}

async function fetchFeed(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(String(res.status));
    return parseICS(await res.text());
  } catch (e) {
    console.error("iCal indisponible:", url.slice(0, 40), e.message);
    return [];
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
    out.push({
      start: s.metadata.checkIn,
      end: s.metadata.checkOut,
      id: s.id,
      paid,
      created: s.created,
    });
  }
  return out;
}

/** Ensemble des nuits indisponibles (chaînes ISO) */
export async function getBlockedNights() {
  const feeds = [process.env.AIRBNB_ICAL_URL, process.env.BOOKING_ICAL_URL].filter(Boolean);
  const external = feeds.length
    ? (await Promise.all(feeds.map(fetchFeed))).flat()
    : DEMO_EVENTS;
  const internal = await siteBookings().catch((e) => {
    console.error("Stripe:", e.message);
    return [];
  });
  const today = toISO(new Date());
  const set = new Set();
  for (const ev of [...external, ...internal]) {
    for (const n of nightsOf(ev.start, ev.end)) if (n >= today) set.add(n);
  }
  return { blocked: set, demo: feeds.length === 0 };
}
