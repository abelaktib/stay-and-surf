import { getBlockedNights } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET() {
  const { blocked, demo } = await getBlockedNights();
  return Response.json(
    { blocked: [...blocked].sort(), demo },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
  );
}
