import { test, expect } from "@playwright/test";
import { prepare } from "./helpers";

const ld = async (page) =>
  (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));
const types = (blocks) => blocks.flatMap((b) => (b["@graph"] ? b["@graph"] : [b])).map((n) => n["@type"]);

test.describe("SEO", () => {
  test("le guide surf existe en FR et EN, avec un H1 local et des titres en questions", async ({ page }) => {
    await prepare(page);
    for (const [path, h1] of [["/fr/surf-oualidia", "Surfer à Oualidia"], ["/en/surf-oualidia", "Surfing in Oualidia"]]) {
      const res = await page.goto(path);
      expect(res.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
      expect(await page.getByRole("heading", { level: 2 }).filter({ hasText: "?" }).count()).toBeGreaterThanOrEqual(4);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path}$`));
    }
  });

  test("le guide porte Article et BreadcrumbList, et cite ses sources", async ({ page }) => {
    await prepare(page);
    await page.goto("/fr/surf-oualidia");
    const t = types(await ld(page));
    expect(t).toContain("Article");
    expect(t).toContain("BreadcrumbList");
    expect(await page.locator("a[href^='https://']").filter({ hasText: /surf/i }).count()).toBeGreaterThan(0);
    await expect(page.locator("time[datetime]").first()).toBeVisible();
  });

  test("l'accueil relie le guide et déclare l'organisation et le site", async ({ page }) => {
    await prepare(page);
    await page.goto("/fr");
    await expect(page.locator('main a[href="/fr/surf-oualidia"]').first()).toBeAttached();
    const t = types(await ld(page));
    for (const x of ["Organization", "WebSite", "VacationRental"]) expect(t).toContain(x);
  });

  test("le sitemap liste le guide avec ses alternatives de langue", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/fr/surf-oualidia");
    expect(xml).toContain("/en/surf-oualidia");
  });

  test("chaque page indexable a un titre et une description uniques", async ({ page }) => {
    const seen = new Map();
    for (const path of ["/fr", "/en", "/fr/surf-oualidia", "/en/surf-oualidia", "/fr/informations-legales", "/en/informations-legales"]) {
      await page.goto(path);
      const title = await page.title();
      const desc = await page.locator('meta[name="description"]').getAttribute("content");
      expect(title.length).toBeLessThanOrEqual(65);
      expect(desc.length).toBeGreaterThan(70);
      expect(desc.length).toBeLessThanOrEqual(165);
      expect(seen.has(title), `titre en double : ${title}`).toBe(false);
      seen.set(title, path);
    }
  });
});

test("le changement de langue garde la page en cours", async ({ page }, info) => {
  test.skip(info.project.name === "mobile", "sélecteur de bureau");
  await prepare(page);
  await page.goto("/fr/surf-oualidia");
  await page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/surf-oualidia$/);
});
