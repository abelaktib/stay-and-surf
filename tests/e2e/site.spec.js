import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { prepare } from "./helpers";

const isMobile = (p) => p.project.name === "mobile";

test.describe("Pages et navigation", () => {
  test("l'accueil se charge sans erreur console", async ({ page }) => {
    const errors = await prepare(page);
    const res = await page.goto("/fr");
    expect(res.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Surfer Oualidia");
    await expect(page).toHaveTitle(/Oualidia/);
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("redirige / vers la langue du navigateur", async ({ browser }) => {
    const en = await browser.newContext({ locale: "en-GB" });
    const p = await en.newPage();
    await p.goto("/");
    await expect(p).toHaveURL(/\/en$/);
    await en.close();
    const fr = await browser.newContext({ locale: "fr-FR" });
    const q = await fr.newPage();
    await q.goto("/");
    await expect(q).toHaveURL(/\/fr$/);
    await fr.close();
  });

  test("métadonnées SEO et hreflang", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/en$/);
    await expect(page.locator('link[hreflang="fr"]')).toHaveCount(1);
    const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    expect(ld["@type"]).toBe("VacationRental");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og\.jpg/);
  });

  test("404 traduite pour une adresse inconnue", async ({ page }) => {
    await prepare(page);
    const res = await page.goto("/en/does-not-exist");
    expect(res.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("drifted");
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL(/\/en$/);
  });

  test("informations légales accessibles depuis le pied de page", async ({ page }) => {
    await prepare(page);
    await page.goto("/fr");
    await page.getByRole("contentinfo").getByRole("link", { name: "Informations légales" }).click();
    await expect(page).toHaveURL(/informations-legales/);
    await expect(page.getByRole("heading", { level: 2, name: "Confidentialité" })).toBeVisible();
  });

  test("changement de langue", async ({ page }, info) => {
    test.skip(isMobile(info), "sélecteur de bureau");
    await prepare(page);
    await page.goto("/fr");
    await page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "EN", exact: true }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Surf Oualidia");
  });

  test("lien d'évitement vers le contenu", async ({ page }, info) => {
    test.skip(isMobile(info), "clavier");
    await prepare(page);
    await page.goto("/fr");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Aller au contenu" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#contenu$/);
  });

  test("le contenu reste lisible sans JavaScript", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const p = await ctx.newPage();
    await p.goto("/fr");
    await p.waitForTimeout(1600);
    await expect(p.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(p.getByText("Questions fréquentes")).toBeVisible();
    await ctx.close();
  });
});

test.describe("Menu mobile", () => {
  test("s'ouvre, se ferme avec Échap et rend le focus", async ({ page }, info) => {
    test.skip(!isMobile(info), "mobile uniquement");
    await prepare(page);
    await page.goto("/fr");
    const btn = page.getByRole("button", { name: "Menu" });
    await btn.click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Fermer" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(btn).toBeFocused();
    await btn.click();
    await dialog.getByRole("link", { name: "Le séjour" }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/#sejour$/);
  });

  test("la barre de réservation apparaît après le héros", async ({ page }, info) => {
    test.skip(!isMobile(info), "mobile uniquement");
    await prepare(page);
    await page.goto("/fr");
    await page.mouse.wheel(0, 3000);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.5));
    await expect(page.locator(".sticky-book")).toBeVisible();
  });
});

test.describe("Galerie", () => {
  test("ouvre une pièce, fait défiler les photos, se ferme", async ({ page }) => {
    await prepare(page);
    await page.goto("/fr");
    await page.getByRole("button", { name: /Voir les photos : Le salon/ }).click();
    const dialog = page.getByRole("dialog", { name: "Le salon" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Photo 1 sur 5")).toBeVisible();
    await dialog.getByRole("button", { name: "Photo suivante" }).click();
    await expect(dialog.getByText("Photo 2 sur 5")).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.getByText("Photo 1 sur 5")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});

test.describe("Réservation", () => {
  const blocked = ["2026-11-20", "2026-11-21", "2026-11-22"];

  async function pick(page, a, b) {
    await page.locator("#reserver").scrollIntoViewIfNeeded();
    await page.locator(`button[data-d="${a}"]`).click();
    await page.locator(`button[data-d="${b}"]`).click();
  }

  test("parcours complet : dates, prix, coordonnées, paiement désactivé", async ({ page }, info) => {
    await prepare(page, { blocked });
    await page.goto("/fr");
    if (isMobile(info)) {
      await page.locator("#reserver").scrollIntoViewIfNeeded();
      await page.getByRole("button", { name: "Mois suivant" }).click();
    }
    await pick(page, "2026-11-03", "2026-11-10");
    const summary = page.getByRole("complementary", { name: "Votre séjour" });
    await expect(summary.getByText("700 €").first()).toBeVisible();
    await summary.getByRole("button", { name: "Ajouter un voyageur" }).click();
    await expect(summary.getByText("1 050 €").first()).toBeVisible();
    await page.getByLabel("Nom complet").fill("Test Voyageur");
    await page.getByLabel("E-mail").fill("test@example.com");
    await page.getByRole("button", { name: /Payer .* et réserver/ }).click();
    const alert = page.getByRole("alert").filter({ hasText: "pas encore activé" });
    await expect(alert).toBeVisible();
    await expect(alert.getByRole("link")).toHaveAttribute("href", /^mailto:/);
  });

  test("redirige vers Stripe quand le paiement est créé", async ({ page }, info) => {
    test.skip(isMobile(info), "même logique que sur bureau");
    await prepare(page, { blocked });
    await page.route("**/api/checkout", (r) => r.fulfill({ json: { url: "/fr/merci?session_id=cs_test_fake" } }));
    await page.goto("/fr");
    await pick(page, "2026-11-03", "2026-11-10");
    await page.getByLabel("Nom complet").fill("Test Voyageur");
    await page.getByLabel("E-mail").fill("test@example.com");
    await page.getByRole("button", { name: /Payer/ }).click();
    await expect(page).toHaveURL(/\/fr\/merci/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("validation");
  });

  test("refuse un séjour trop court et des nuits prises", async ({ page }, info) => {
    test.skip(isMobile(info), "logique identique");
    await prepare(page, { blocked });
    await page.goto("/fr");
    await page.locator("#reserver").scrollIntoViewIfNeeded();
    // 7 nuits à partir du 16 novembre traverseraient les nuits prises
    await expect(page.locator('button[data-d="2026-11-16"]')).toBeDisabled();
    await page.locator('button[data-d="2026-11-03"]').click();
    await expect(page.getByRole("status").filter({ hasText: "départ" })).toBeVisible();
    // Départ avant 7 nuits : refusé avec une explication
    await page.locator('button[data-d="2026-11-06"]').click();
    await expect(page.getByRole("status").filter({ hasText: "7 nuits minimum" })).toBeVisible();
    await expect(page.getByText("Sélectionnez vos dates pour voir le prix.")).toHaveCount(0);
  });

  test("affiche une erreur si l'API refuse les dates (prises entre-temps)", async ({ page }, info) => {
    test.skip(isMobile(info), "logique identique");
    await prepare(page, { blocked });
    await page.route("**/api/checkout", (r) => r.fulfill({ status: 409, json: { error: "unavailable" } }));
    await page.goto("/fr");
    await pick(page, "2026-11-03", "2026-11-10");
    await page.getByLabel("Nom complet").fill("Test Voyageur");
    await page.getByLabel("E-mail").fill("test@example.com");
    await page.getByRole("button", { name: /Payer/ }).click();
    await expect(page.getByText("Sélectionnez vos dates pour voir le prix.")).toBeVisible();
  });

  test("calendrier : panne réseau puis nouvel essai", async ({ page }) => {
    await prepare(page);
    let fail = true;
    await page.route("**/api/availability", (r) =>
      fail ? r.fulfill({ status: 503, json: { error: "unavailable" } }) : r.fulfill({ json: { blocked: [], demo: false, degraded: false } })
    );
    await page.goto("/fr#reserver");
    const alert = page.getByRole("alert").filter({ hasText: "disponibilités" });
    await expect(alert).toBeVisible();
    fail = false;
    await alert.getByRole("button", { name: "Réessayer" }).click();
    await expect(alert).toBeHidden();
    await expect(page.locator('button[data-d="2026-11-03"]')).toBeEnabled();
  });

  test("navigation au clavier dans le calendrier", async ({ page }, info) => {
    test.skip(isMobile(info), "clavier");
    await prepare(page, { blocked: [] });
    await page.goto("/fr#reserver");
    const d = page.locator('button[data-d="2026-11-03"]');
    await d.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator('button[data-d="2026-11-04"]')).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator('button[data-d="2026-11-11"]')).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator('button[data-d="2026-11-11"]')).toHaveAttribute("aria-pressed", "true");
  });

  test("message d'annulation au retour de Stripe", async ({ page }) => {
    await prepare(page, { blocked: [] });
    await page.goto("/fr?annule=1#reserver");
    await expect(page.getByText("Paiement annulé")).toBeVisible();
  });
});

test.describe("Accessibilité (axe-core, WCAG 2.2 AA)", () => {
  for (const path of ["/fr", "/en", "/fr/informations-legales", "/fr/inconnue"]) {
    test(`aucune violation sur ${path}`, async ({ page }) => {
      await prepare(page, { blocked: ["2026-11-20"] });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      if (path === "/fr") {
        await page.locator("#reserver").scrollIntoViewIfNeeded();
        await page.locator(".cal-month button.day").first().waitFor();
      }
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const summary = r.violations.map((v) => `${v.id} (${v.impact}) : ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
      expect(summary).toEqual([]);
    });
  }
});

test.describe("Préférences", () => {
  test("animations réduites : pas de voile, héros immobile et lisible", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto("/fr");
    await expect(p.locator(".intro-veil")).toBeHidden();
    await expect(p.getByRole("heading", { level: 1 })).toBeVisible();
    const h = await p.locator(".hero").evaluate((el) => el.offsetHeight / window.innerHeight);
    expect(h).toBeLessThanOrEqual(1.01);
    await ctx.close();
  });

  test("première visite : le voile s'efface puis libère la page", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.locator(".intro-veil")).toBeHidden({ timeout: 4000 });
    await page.reload();
    await expect(page.locator(".intro-veil")).toBeHidden();
  });
});
