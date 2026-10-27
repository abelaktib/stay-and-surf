import { siteBookings } from "@/lib/availability";

export const dynamic = "force-dynamic";

/**
 * Calendrier des réservations payées sur le site.
 * À importer dans Airbnb et Booking pour qu'ils bloquent ces dates automatiquement.
 */
export async function GET(req) {
  const token = process.env.ICAL_EXPORT_TOKEN;
  if (token && new URL(req.url).searchParams.get("token") !== token) {
    return new Response("Not found", { status: 404 });
  }
  const bookings = (await siteBookings().catch(() => [])).filter((b) => b.paid);
  const d = (iso) => iso.replaceAll("-", "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
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
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
