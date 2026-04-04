import { test, expect } from "@playwright/test";

test("item optional boxes are below the rules box", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  // Find Potion of Healing which has price + weight
  const card = page.locator(".card", {
    has: page.locator(".title-name", { hasText: "Potion of Healing" }),
  }).first();

  await card.screenshot({ path: "test-results/potion-card.png" });

  const rulesBox = card.locator(".rules-box");
  const rulesBoxBounds = await rulesBox.boundingBox();

  const optBoxes = card.locator(".optional-box");
  const count = await optBoxes.count();
  expect(count).toBeGreaterThan(0);

  // Each box should be below the rules box
  for (let i = 0; i < count; i++) {
    const box = await optBoxes.nth(i).boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(rulesBoxBounds!.y + rulesBoxBounds!.height - 1);
  }
});
