import { test, expect } from "@playwright/test";

test("preview page renders all cards without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/", { waitUntil: "networkidle" });

  // Should have no console errors
  expect(errors).toEqual([]);

  // Should render multiple cards
  const cards = page.locator(".card");
  const count = await cards.count();
  expect(count).toBeGreaterThan(1);

  // Screenshot for visual inspection
  await page.screenshot({ path: "test-results/preview.png", fullPage: true });

  // Every card should have dimensions
  for (let i = 0; i < Math.min(count, 5); i++) {
    const box = await cards.nth(i).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  }
});

test("Greater Astral Wisp expands to portrait + stats + actions cards", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  // Page 1: portrait card with full-bleed art and name at the bottom
  const portrait = page.locator(".card", { has: page.locator(".portrait-art") })
    .filter({ has: page.locator(".portrait-title-text", { hasText: "Greater Astral Wisp" }) });
  await expect(portrait).toHaveCount(1);
  await portrait.screenshot({ path: "test-results/wisp-card-1.png" });

  // Page 2: stats card with the stat block
  const statsCard = page.locator(".card", {
    has: page.locator(".monster-stats"),
  }).filter({ has: page.locator(".title-name", { hasText: "Greater Astral Wisp" }) });
  await expect(statsCard).toHaveCount(1);
  await statsCard.screenshot({ path: "test-results/wisp-card-2.png" });

  // Page 3: actions card with type_line as title, containing "Multiattack" (unique to Greater)
  const actionsCard = page.locator(".card", {
    has: page.locator(".title-name", { hasText: "Tiny Aberration, Chaotic Neutral" }),
  }).filter({
    has: page.locator(":text('Multiattack')"),
  });
  await expect(actionsCard).toHaveCount(1);
  await actionsCard.screenshot({ path: "test-results/wisp-card-3.png" });
});

test("no monster stat block overflows", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const statBlocks = page.locator(".monster-stats");
  const count = await statBlocks.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const overflow = await statBlocks.nth(i).evaluate(
      (el) => el.scrollHeight > el.clientHeight,
    );
    expect(overflow).toBe(false);
  }
});

test("cards with existing art files display loaded images", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const images = page.locator(".art-image");
  const count = await images.count();
  expect(count).toBeGreaterThan(0);

  // Verify images with valid src actually loaded
  const results = await images.evaluateAll((els) =>
    (els as HTMLImageElement[]).map((el) => ({
      src: el.src,
      loaded: el.naturalWidth > 0,
    })),
  );

  const withSrc = results.filter((r) => r.src);
  const loaded = withSrc.filter((r) => r.loaded);

  // At least some images should load (some art files may be missing from disk)
  expect(loaded.length).toBeGreaterThan(0);

  // Potion images specifically should load
  const potionImages = results.filter((r) => r.src.includes("potion"));
  expect(potionImages.length).toBeGreaterThan(0);
  for (const img of potionImages) {
    expect(img.loaded).toBe(true);
  }
});
