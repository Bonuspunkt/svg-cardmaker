import { test, expect } from "@playwright/test";

test("no rules-box overflow in normal mode", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const boxes = page.locator(".rules-box");
  const count = await boxes.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const info = await boxes.nth(i).evaluate((el) => {
      const card = el.closest(".card");
      const name =
        card?.querySelector(".title-name")?.textContent || "unknown";
      return {
        name,
        overflow: el.scrollHeight > el.clientHeight + 1,
        scrollH: el.scrollHeight,
        clientH: el.clientHeight,
      };
    });
    if (info.overflow) {
      console.log(
        `OVERFLOW (normal): "${info.name}" scrollH=${info.scrollH} clientH=${info.clientH}`,
      );
    }
    expect(
      info.overflow,
      `rules-box overflows for "${info.name}"`,
    ).toBe(false);
  }
});

test("tent mode: no rules-box or monster-rules overflow", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  // Ensure tent mode is active (default is tent, button shows "Multi-Page")
  const btn = page.locator("button:has-text('Tent Card')");
  if ((await btn.count()) > 0) {
    await btn.click();
    await page.waitForTimeout(300);
  }

  // Check .rules-box (items/spells)
  const rulesBoxes = page.locator(".rules-box");
  const rbCount = await rulesBoxes.count();
  for (let i = 0; i < rbCount; i++) {
    const info = await rulesBoxes.nth(i).evaluate((el) => {
      const card = el.closest(".card");
      const name =
        card?.querySelector(".title-name")?.textContent || "unknown";
      return {
        name,
        overflow: el.scrollHeight > el.clientHeight + 1,
        scrollH: el.scrollHeight,
        clientH: el.clientHeight,
      };
    });
    if (info.overflow) {
      console.log(
        `OVERFLOW (tent rules-box): "${info.name}" scrollH=${info.scrollH} clientH=${info.clientH}`,
      );
    }
    expect(
      info.overflow,
      `tent rules-box overflows for "${info.name}"`,
    ).toBe(false);
  }

  // Check .monster-rules (monsters)
  const monsterRules = page.locator(".monster-rules");
  const mrCount = await monsterRules.count();
  for (let i = 0; i < mrCount; i++) {
    const info = await monsterRules.nth(i).evaluate((el) => {
      const card = el.closest(".card");
      const name =
        card?.querySelector(".title-name")?.textContent || "unknown";
      return {
        name,
        overflow: el.scrollHeight > el.clientHeight + 1,
        scrollH: el.scrollHeight,
        clientH: el.clientHeight,
      };
    });
    if (info.overflow) {
      console.log(
        `OVERFLOW (tent monster-rules): "${info.name}" scrollH=${info.scrollH} clientH=${info.clientH}`,
      );
    }
    expect(
      info.overflow,
      `tent monster-rules overflows for "${info.name}"`,
    ).toBe(false);
  }
});

test("tent mode: fold dividers are present at fold lines", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  // Ensure tent mode is active (default is tent)
  const btn = page.locator("button:has-text('Multi-Page')");
  if ((await btn.count()) === 0) {
    await page.click("button:has-text('Tent Card')");
    await page.waitForTimeout(300);
  }

  const dividers = page.locator(".tent-divider");
  const count = await dividers.count();
  expect(count).toBeGreaterThan(0);
});

test("tent mode: screenshot items for visual review", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  // Ensure tent mode is active (default is tent, button shows "Multi-Page")
  const btn = page.locator("button:has-text('Tent Card')");
  if ((await btn.count()) > 0) {
    await btn.click();
    await page.waitForTimeout(300);
  }

  await page.screenshot({
    path: "test-results/tent-mode-full.png",
    fullPage: true,
  });

  const items = page.locator("#items");
  if ((await items.count()) > 0) {
    await items.screenshot({ path: "test-results/tent-items.png" });
  }

  const monsters = page.locator("#monsters");
  if ((await monsters.count()) > 0) {
    await monsters.screenshot({ path: "test-results/tent-monsters.png" });
  }
});
