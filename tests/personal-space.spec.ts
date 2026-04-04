import { test, expect } from "@playwright/test";

test("Personal Space card overflows to continuation", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  // Find the main card
  const mainCard = page.locator(".card:visible", {
    has: page.locator(".title-name", { hasText: "Personal Space" }),
  });
  await expect(mainCard).toHaveCount(1);
  await mainCard.screenshot({ path: "test-results/personal-space-1.png" });

  // The rules text should not overflow on the main card
  const rulesBox = mainCard.locator(".rules-box");
  const overflow = await rulesBox.evaluate((el) => el.scrollHeight > el.clientHeight);
  expect(overflow).toBe(false);
});
