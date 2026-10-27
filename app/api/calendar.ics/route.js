import { timingSafeEqual } from "node:crypto";
import { siteBookings } from "@/lib/availability";
import { buildICS } from "@/lib/ical";

export const dynamic = "force-dynamic";

const same = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

/**
 * Calendrier des réservations payées sur le site (dates seulement, aucune donnée client).
 * À importer dans Airbnb et Booking pour qu'ils bloquent ces dates automatiquement.
 */
export async function GET(req) {
  const token = process.env.ICAL_EXPORT_TOKEN;
  if (token && !same(new URL(req.url).searchParams.get("token") || "", token)) {
    return new Response("Not found", { status: 404 });
  }
  let bookings;
  try {
    bookings = (await siteBookings()).filter((b) => b.paid);
  } catch (e) {
    // Mieux vaut une erreur (Airbnb garde alors l'ancienne version) qu'un calendrier vide qui libérerait des dates
    console.error("[calendar.ics]", e?.message);
    return new Response("Service unavailable", { status: 503, headers: { "Retry-After": "300" } });
  }
  return new Response(buildICS(bookings), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
