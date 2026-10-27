import { describe, it, expect, vi, beforeEach } from "vitest";

// Intégration de la route de paiement avec Stripe et les calendriers simulés
const create = vi.fn(async () => ({ url: "https://checkout.stripe.com/c/pay/cs_test_x" }));
const state = { blocked: new Set(), degraded: false, openHolds: 0, stripe: true };
vi.mock("@/lib/availability", () => ({
  APP_TAG: "dar-nejma",
  get stripe() {
    return state.stripe ? { checkout: { sessions: { create } } } : null;
  },
  getBlockedNights: async () => ({ blocked: state.blocked, degraded: state.degraded, openHolds: state.openHolds, demo: false }),
}));

const { POST } = await import("@/app/api/checkout/route.js");

let ip = 0;
const call = (body, headers = {}) =>
  POST(
    new Request("https://stayandsurf.com/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${++ip}`, ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
const valid = { name: "Anas B", email: "a@example.com", checkIn: "2027-11-09", checkOut: "2027-11-16", guests: 2, locale: "fr" };

beforeEach(() => {
  // Date figée : les tests ne dépendent pas du jour où ils tournent
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-27T10:00:00Z"));
  create.mockClear();
  Object.assign(state, { blocked: new Set(), degraded: false, openHolds: 0, stripe: true });
});

describe("POST /api/checkout", () => {
  it("crée une session Stripe avec le prix recalculé côté serveur", async () => {
    const r = await call({ ...valid, total: 1 });
    expect(r.status).toBe(200);
    expect((await r.json()).url).toMatch(/^https:\/\/checkout\.stripe\.com/);
    const arg = create.mock.calls[0][0];
    expect(arg.line_items[0].price_data.unit_amount).toBe(70000);
    expect(arg.metadata).toMatchObject({ app: "dar-nejma", checkIn: "2027-11-09", guests: "2", total: "700" });
    expect(arg.success_url).toBe("https://stayandsurf.com/fr/merci?session_id={CHECKOUT_SESSION_ID}");
    expect(arg.expires_at - Date.now() / 1000).toBeGreaterThan(30 * 60);
  });
  it("refuse une origine étrangère (CSRF)", async () => {
    expect((await call(valid, { origin: "https://evil.example" })).status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });
  it("refuse un autre type de contenu", async () => {
    expect((await call(valid, { "content-type": "text/plain" })).status).toBe(415);
  });
  it("refuse un corps trop gros ou invalide", async () => {
    expect((await call({ ...valid, message: "x".repeat(9000) })).status).toBe(413);
    expect((await call("{pas du json")).status).toBe(400);
  });
  it("refuse des coordonnées invalides", async () => {
    const r = await call({ ...valid, email: "nope" });
    expect(r.status).toBe(400);
    expect((await r.json()).error).toBe("contact");
  });
  it("renvoie 409 si les dates sont prises", async () => {
    state.blocked = new Set(["2027-11-12"]);
    expect((await call(valid)).status).toBe(409);
  });
  it("suspend le paiement si un calendrier externe ne répond pas", async () => {
    state.degraded = true;
    const r = await call(valid);
    expect(r.status).toBe(503);
    expect((await r.json()).error).toBe("sync");
  });
  it("limite le nombre de paiements ouverts en même temps", async () => {
    state.openHolds = 4;
    expect((await call(valid)).status).toBe(429);
  });
  it("limite le débit par adresse IP", async () => {
    const h = { "x-forwarded-for": "10.9.9.9" };
    const codes = [];
    for (let i = 0; i < 6; i++) codes.push((await call(valid, h)).status);
    expect(codes.slice(0, 5).every((c) => c === 200)).toBe(true);
    expect(codes[5]).toBe(429);
  });
  it("répond payments_off sans clé Stripe", async () => {
    state.stripe = false;
    expect((await (await call(valid)).json()).error).toBe("payments_off");
  });
  it("ne divulgue pas l'erreur Stripe", async () => {
    create.mockRejectedValueOnce(Object.assign(new Error("secret internal detail"), { type: "StripeAPIError" }));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await call(valid);
    expect(r.status).toBe(502);
    expect(JSON.stringify(await r.json())).not.toMatch(/secret/);
    spy.mockRestore();
  });
});
