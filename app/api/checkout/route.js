import { getBlockedNights, stripe, APP_TAG } from "@/lib/availability";
import { quote, validateStay, toISO } from "@/lib/pricing";
import { SITE, STAY } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!stripe) return Response.json({ error: "payments_off" }, { status: 503 });

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "dates" }, { status: 400 });
  }
  const { checkIn, checkOut, guests, name, email, phone, message, locale } = body;
  const lang = locale === "en" ? "en" : "fr";

  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || "")) {
    return Response.json({ error: "contact" }, { status: 400 });
  }

  const { blocked } = await getBlockedNights();
  const err = validateStay({ checkIn, checkOut, guests }, blocked, toISO(new Date()));
  if (err) return Response.json({ error: err }, { status: err === "unavailable" ? 409 : 400 });

  const q = quote(checkIn, checkOut, Number(guests));
  const origin = req.headers.get("origin") || SITE.url;
  const label =
    lang === "fr"
      ? `Séjour surf à ${SITE.house}, Oualidia`
      : `Surf stay at ${SITE.house}, Oualidia`;
  const desc =
    lang === "fr"
      ? `Du ${checkIn} au ${checkOut}, ${q.nights} nuits, ${q.guests} pers.${q.dueLater ? ` Acompte ; solde de ${q.dueLater} € à régler sur place.` : ""}`
      : `${checkIn} to ${checkOut}, ${q.nights} nights, ${q.guests} guests.${q.dueLater ? ` Deposit; balance of €${q.dueLater} due on arrival.` : ""}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: lang,
    customer_email: email.trim(),
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
      name: name.trim().slice(0, 200),
      phone: (phone || "").slice(0, 40),
      message: (message || "").slice(0, 450),
      locale: lang,
    },
    payment_intent_data: {
      description: `${SITE.house} ${checkIn} > ${checkOut} (${q.guests} pers.)`,
    },
    expires_at: Math.floor(Date.now() / 1000) + Math.max(31, STAY.holdMinutes) * 60,
    success_url: `${origin}/${lang}/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/${lang}?annule=1#reserver`,
  });

  return Response.json({ url: session.url });
}
