/**
 * GET /api/availability
 *
 * Fetch les flux iCal Booking et Airbnb configurés dans .env.local,
 * parse les VEVENT, puis renvoie la liste des jours indisponibles au format
 * ISO (YYYY-MM-DD).
 *
 * Si aucune URL n'est configurée, renvoie les dates réelles extraites du
 * fichier iCal Booking fourni (mise à jour : 23/04/2026).
 */

const CACHE_SECONDS = Number(process.env.AVAILABILITY_CACHE_SECONDS) || 1800;

/* ── Fallback : vraies plages réservées actuelles de Dar Nejma ────────────
   Format iCal : `end` est exclusif (convention check-out). */
const FALLBACK_EVENTS = [
  { start: "2026-04-14", end: "2026-05-07" },
  { start: "2026-05-08", end: "2026-05-18" },
  { start: "2026-05-22", end: "2026-05-25" },
  { start: "2026-05-26", end: "2026-05-29" },
  { start: "2026-07-28", end: "2026-07-31" },
  { start: "2026-08-12", end: "2026-08-14" },
  { start: "2026-10-22", end: "2026-10-29" },
  { start: "2027-01-18", end: "2027-04-24" },
];

/* ── Utilitaires ─────────────────────────────────────────────── */

function parseICalDate(s) {
  // Formats supportés : YYYYMMDD ou YYYY-MM-DD
  const clean = s.replace(/-/g, "").slice(0, 8);
  const y = Number(clean.slice(0, 4));
  const m = Number(clean.slice(4, 6)) - 1;
  const d = Number(clean.slice(6, 8));
  return new Date(Date.UTC(y, m, d));
}

function toISO(d) {
  return d.toISOString().split("T")[0];
}

function parseICS(text) {
  const events = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let current = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "BEGIN:VEVENT") {
      current = {};
    } else if (line === "END:VEVENT") {
      if (current && current.start && current.end) events.push(current);
      current = null;
    } else if (current) {
      // Gère DTSTART, DTSTART;VALUE=DATE:..., DTSTART;TZID=... , etc.
      const match = line.match(/^(DTSTART|DTEND)(?:;[^:]*)?:(.+)$/i);
      if (match) {
        const key = match[1].toUpperCase() === "DTSTART" ? "start" : "end";
        current[key] = match[2].replace(/T.+/, "").trim();
      }
    }
  }
  return events;
}

function expandBlockedDays(events) {
  const set = new Set();
  for (const ev of events) {
    const start = parseICalDate(ev.start);
    const end = parseICalDate(ev.end);
    // [start, end) — convention iCal : end exclusif
    for (
      let d = new Date(start);
      d < end;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      set.add(toISO(d));
    }
  }
  return [...set].sort();
}

async function fetchAndParse(url) {
  try {
    const res = await fetch(url, {
      next: { revalidate: CACHE_SECONDS },
      headers: { "User-Agent": "StayAndSurf/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return parseICS(text);
  } catch (err) {
    console.error(`[availability] fetch failed for ${url}:`, err.message);
    return [];
  }
}

/* ── Handler ─────────────────────────────────────────────── */

export async function GET() {
  const urls = [
    process.env.BOOKING_ICAL_URL,
    process.env.AIRBNB_ICAL_URL,
  ].filter(Boolean);

  let events = [];
  let source = "fallback";

  if (urls.length > 0) {
    const results = await Promise.all(urls.map(fetchAndParse));
    events = results.flat();
    source = urls.length === 2 ? "booking+airbnb" : "booking-or-airbnb";
  }

  // Filet de sécurité : si les flux sont tombés ou non configurés
  if (events.length === 0) {
    events = FALLBACK_EVENTS;
  }

  const blocked = expandBlockedDays(events);

  return Response.json(
    {
      source,
      updatedAt: new Date().toISOString(),
      count: blocked.length,
      blocked,
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
      },
    }
  );
}
