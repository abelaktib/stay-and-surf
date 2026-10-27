import { getBlockedNights, stripe, APP_TAG } from "@/lib/availability";
import { quote, validateStay, toISO } from "@/lib/pricing";
import { validateContact, LOCALE_OK } from "@/lib/booking";
import { createLimiter, clientIp } from "@/lib/ratelimit";
import { SITE, STAY } from "@/lib/config";

export const dynamic = "force-dynamic";

const MAX_BODY = 8 * 1024;
// 5 demandes de paiement par adresse IP et par tranche de 10 minutes
const limiter = createLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });
// Au-delà de ce nombre de paiements ouverts en même temps, on refuse (anti-blocage massif des dates)
const MAX_OPEN_HOLDS = 4;

const fail = (error, status, headers) => Response.json({ error }, { status, headers });

export async function POST(req) {
  const selfOrigin = new URL(req.url).origin;
  const origin = req.headers.get("origin");
  // Protection CSRF : seules les pages du site peuvent lancer un paiement
  if (origin && origin !== selfOrigin && origin !== SITE.url) return fail("forbidden", 403);
  if (!(req.headers.get("content-type") || "").includes("application/json")) return fail("dates", 415);
  if (Number(req.headers.get("content-length") || 0) > MAX_BODY) return fail("dates", 413);

  const rl = limiter(clientIp(req));
  if (!rl.ok) return fail("rate", 429, { "Retry-After": String(rl.retryAfter) });

  let body;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) return fail("dates", 413);
    body = JSON.parse(raw);
  } catch {
    return fail("dates", 400);
  }
  const lang = LOCALE_OK(body?.locale);
  const contact = validateContact(body);
  if (contact.error) return fail(contact.error, 400);
  const { name, email, phone, message } = contact.data;
  const { checkIn, checkOut, guests } = body;
  if (!stripe) return fail("payments_off", 503);

  try {
    const { blocked, degraded, openHolds } = await getBlockedNights();
    // Si un calendrier Airbnb/Booking ne répond pas, on ne prend pas le risque d'une double réservation
    if (degraded) return fail("sync", 503);
    const err = validateStay({ checkIn, checkOut, guests }, blocked, toISO(new Date()));
    if (err) return fail(err, err === "unavailable" ? 409 : 400);

    if (openHolds >= MAX_OPEN_HOLDS) return fail("busy", 429, { "Retry-After": "600" });

    const q = quote(checkIn, checkOut, Number(guests));
    const label = lang === "fr" ? `Séjour surf à ${SITE.house}, Oualidia` : `Surf stay at ${SITE.house}, Oualidia`;
    const desc =
      lang === "fr"
        ? `Du ${checkIn} au ${checkOut}, ${q.nights} nuits, ${q.guests} pers.${q.dueLater ? ` Acompte ; solde de ${q.dueLater} € à régler sur place.` : ""}`
        : `${checkIn} to ${checkOut}, ${q.nights} nights, ${q.guests} guests.${q.dueLater ? ` Deposit; balance of €${q.dueLater} due on arrival.` : ""}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: lang,
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: STAY.currency,
            unit_amount: q.dueNow * 100,
            product_data: { name: label, description: desc },
          },
        },
      ],
      metadata: {
        app: APP_TAG,
        checkIn,
        checkOut,
        guests: String(q.guests),
        total: String(q.total),
        name,
        phone,
        message,
        locale: lang,
      },
      payment_intent_data: {
        description: `${SITE.house} ${checkIn} > ${checkOut} (${q.guests} pers.)`,
      },
      expires_at: Math.floor(Date.now() / 1000) + Math.max(31, STAY.holdMinutes) * 60,
      success_url: `${selfOrigin}/${lang}/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${selfOrigin}/${lang}?annule=1#reserver`,
    });
    return Response.json({ url: session.url });
  } catch (e) {
    // Pas de détail interne renvoyé au client
    console.error("[checkout]", e?.type || "", e?.message);
    return fail("generic", 502);
  }
}
