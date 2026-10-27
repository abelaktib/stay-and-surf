import { addDays, isISODate } from "./pricing";

/**
 * Lit un flux iCal (Airbnb, Booking) et renvoie les plages réservées
 * sous la forme { start, end } en dates ISO, `end` exclu (jour du départ).
 */
export function parseICS(text) {
  const events = [];
  if (typeof text !== "string" || !text.includes("BEGIN:VCALENDAR")) return null;
  // Déplie les lignes repliées (RFC 5545)
  const lines = text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
  let cur = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (line === "BEGIN:VEVENT") cur = {};
    else if (line === "END:VEVENT") {
      if (cur?.start && isISODate(cur.start)) {
        const end = cur.end && isISODate(cur.end) && cur.end > cur.start ? cur.end : addDays(cur.start, 1);
        if (!cur.cancelled) events.push({ start: cur.start, end });
      }
      cur = null;
    } else if (cur) {
      const m = line.match(/^(DTSTART|DTEND)(?:;[^:]*)?:(\d{8})/i);
      if (m) {
        const v = m[2];
        cur[m[1].toUpperCase() === "DTSTART" ? "start" : "end"] = `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
      } else if (/^STATUS:CANCELLED$/i.test(line)) cur.cancelled = true;
    }
  }
  return events;
}

/** Génère le calendrier exporté (réservations du site), sans donnée personnelle. */
export function buildICS(bookings, now = new Date()) {
  const d = (iso) => iso.replaceAll("-", "");
  const stamp = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Stay and Surf//Dar Nejma//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...bookings.flatMap((b) => [
      "BEGIN:VEVENT",
      `UID:${b.id}@stayandsurf`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d(b.start)}`,
      `DTEND;VALUE=DATE:${d(b.end)}`,
      "SUMMARY:Reserve (site Stay & Surf)",
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
