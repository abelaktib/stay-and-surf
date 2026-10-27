import { getBlockedNights } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { blocked, demo, degraded } = await getBlockedNights();
    return Response.json(
      { blocked: [...blocked].sort(), demo, degraded },
      // Une réponse dégradée n'est pas mise en cache, pour revenir à la normale au plus vite
      { headers: { "Cache-Control": degraded ? "no-store" : "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  } catch (e) {
    console.error("[availability]", e?.message);
    return Response.json({ error: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
