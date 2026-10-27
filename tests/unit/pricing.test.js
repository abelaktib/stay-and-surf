import { describe, it, expect } from "vitest";
import { quote, validateStay, weeklyRateFor, nightsOf, addDays, isISODate } from "@/lib/pricing";

const none = new Set();
const today = "2026-10-27";

describe("dates", () => {
  it("compte les nuits [arrivée, départ)", () => {
    expect(nightsOf("2026-12-30", "2027-01-02")).toEqual(["2026-12-30", "2026-12-31", "2027-01-01"]);
  });
  it("gère les années bissextiles", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
  });
  it("refuse les dates impossibles", () => {
    expect(isISODate("2027-02-30")).toBe(false);
    expect(isISODate("2027-13-01")).toBe(false);
    expect(isISODate("27-01-01")).toBe(false);
    expect(isISODate(20270101)).toBe(false);
    expect(isISODate("2027-06-01")).toBe(true);
  });
});

describe("tarifs", () => {
  it("applique les saisons, y compris à cheval sur le nouvel an", () => {
    expect(weeklyRateFor("2026-11-10")).toBe(350);
    expect(weeklyRateFor("2026-12-25")).toBe(420);
    expect(weeklyRateFor("2027-01-03")).toBe(420);
    expect(weeklyRateFor("2027-05-15")).toBe(380);
    expect(weeklyRateFor("2027-08-31")).toBe(420);
  });
  it("calcule une semaine en basse saison", () => {
    expect(quote("2026-11-10", "2026-11-17", 2)).toMatchObject({ nights: 7, perPerson: 350, total: 700, dueNow: 700, dueLater: 0 });
  });
  it("mélange deux saisons au prorata des nuits", () => {
    // 3 nuits à 350/7 + 4 nuits à 420/7 = 150 + 240 = 390
    expect(quote("2026-12-17", "2026-12-24", 2).total).toBe(780);
  });
  it("multiplie par le nombre de voyageurs", () => {
    expect(quote("2026-11-10", "2026-11-17", 6).total).toBe(2100);
  });
});

describe("validateStay", () => {
  const ok = { checkIn: "2026-11-10", checkOut: "2026-11-17", guests: 2 };
  it("accepte une demande valide", () => expect(validateStay(ok, none, today)).toBeNull());
  it("refuse un format de date invalide", () => expect(validateStay({ ...ok, checkIn: "2026-02-30" }, none, today)).toBe("dates"));
  it("refuse une date passée", () => expect(validateStay({ ...ok, checkIn: "2026-10-01", checkOut: "2026-10-08" }, none, today)).toBe("past"));
  it("refuse moins de 7 nuits", () => expect(validateStay({ ...ok, checkOut: "2026-11-15" }, none, today)).toBe("minNights"));
  it("refuse plus de 60 nuits", () => expect(validateStay({ ...ok, checkOut: "2027-01-15" }, none, today)).toBe("maxNights"));
  it("refuse une arrivée à plus de 18 mois", () => expect(validateStay({ ...ok, checkIn: "2028-06-01", checkOut: "2028-06-08" }, none, today)).toBe("dates"));
  it.each([0, 7, 2.5, "2a", true, null, -1])("refuse %s voyageurs", (g) => expect(validateStay({ ...ok, guests: g }, none, today)).toBe("guests"));
  it("accepte un nombre de voyageurs en texte", () => expect(validateStay({ ...ok, guests: "4" }, none, today)).toBeNull());
  it("refuse si une nuit est prise", () => expect(validateStay(ok, new Set(["2026-11-13"]), today)).toBe("unavailable"));
  it("autorise un départ le jour d'une arrivée suivante", () => expect(validateStay(ok, new Set(["2026-11-17"]), today)).toBeNull());
});
