import { describe, it, expect } from "vitest";
import { parseICS, buildICS } from "@/lib/ical";
import { validateContact } from "@/lib/booking";
import { createLimiter } from "@/lib/ratelimit";

const ics = (body) => `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${body}END:VCALENDAR\r\n`;

describe("parseICS", () => {
  it("lit les événements Airbnb (dates seules)", () => {
    const t = ics("BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261110\r\nDTEND;VALUE=DATE:20261117\r\nSUMMARY:Reserved\r\nEND:VEVENT\r\n");
    expect(parseICS(t)).toEqual([{ start: "2026-11-10", end: "2026-11-17" }]);
  });
  it("lit les dates avec heure et les lignes repliées", () => {
    const t = ics("BEGIN:VEVENT\r\nDTSTART:20261110T140000Z\r\nDTEND:20261112T100000Z\r\nDESCRIPTION:une très\r\n  longue ligne\r\nEND:VEVENT\r\n");
    expect(parseICS(t)).toEqual([{ start: "2026-11-10", end: "2026-11-12" }]);
  });
  it("donne une nuit par défaut sans DTEND et ignore les annulations", () => {
    const t = ics("BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261110\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261201\r\nDTEND;VALUE=DATE:20261205\r\nSTATUS:CANCELLED\r\nEND:VEVENT\r\n");
    expect(parseICS(t)).toEqual([{ start: "2026-11-10", end: "2026-11-11" }]);
  });
  it("ignore les dates invalides", () => {
    const t = ics("BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261340\r\nEND:VEVENT\r\n");
    expect(parseICS(t)).toEqual([]);
  });
  it("renvoie null pour une réponse qui n'est pas un calendrier (page d'erreur)", () => {
    expect(parseICS("<html>Error</html>")).toBeNull();
    expect(parseICS(undefined)).toBeNull();
  });
  it("relit ce qu'il exporte, sans donnée personnelle", () => {
    const out = buildICS([{ id: "cs_test_1", start: "2026-11-10", end: "2026-11-17" }], new Date("2026-10-27T10:00:00Z"));
    expect(parseICS(out)).toEqual([{ start: "2026-11-10", end: "2026-11-17" }]);
    expect(out).not.toMatch(/@[a-z]+\.[a-z]/i);
    expect(out.split("\r\n")[0]).toBe("BEGIN:VCALENDAR");
  });
});

describe("validateContact", () => {
  const ok = { name: "Anas B", email: "Anas@Example.com", phone: "+33 6 12 34 56 78", message: "Salut" };
  it("nettoie et normalise", () => {
    expect(validateContact(ok).data).toEqual({ name: "Anas B", email: "anas@example.com", phone: "+33 6 12 34 56 78", message: "Salut" });
  });
  it.each([
    [{ ...ok, name: " " }, "contact"],
    [{ ...ok, email: "pas-un-email" }, "contact"],
    [{ ...ok, email: "a@b" }, "contact"],
    [{ ...ok, email: "<script>@x.com" }, "contact"],
    [{ ...ok, phone: "abc" }, "phone"],
    [{ ...ok, website: "http://spam" }, "contact"],
    [null, "contact"],
  ])("refuse %j", (body, err) => expect(validateContact(body).error).toBe(err));
  it("tronque les champs trop longs et retire les caractères de contrôle", () => {
    const r = validateContact({ ...ok, message: "x".repeat(2000) + "\u0000", name: "A\u0007nas" }).data;
    expect(r.message.length).toBe(450);
    expect(r.name).toBe("Anas");
  });
});

describe("createLimiter", () => {
  it("bloque au-delà de la limite puis libère après la fenêtre", () => {
    const check = createLimiter({ limit: 2, windowMs: 1000 });
    expect(check("ip", 0).ok).toBe(true);
    expect(check("ip", 10).ok).toBe(true);
    const r = check("ip", 20);
    expect(r.ok).toBe(false);
    expect(r.retryAfter).toBe(1);
    expect(check("autre", 20).ok).toBe(true);
    expect(check("ip", 1001).ok).toBe(true);
  });
});
