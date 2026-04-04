import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";

const VITE_NODE = resolve(import.meta.dirname, "../node_modules/.bin/vite-node");
const RENDER_SCRIPT = resolve(import.meta.dirname, "render-html.tsx");

function renderHtml(count: number): string {
  return execFileSync(VITE_NODE, [RENDER_SCRIPT, String(count)], {
    encoding: "utf-8",
  });
}

async function loadHtml(
  page: import("@playwright/test").Page,
  count: number,
) {
  const html = renderHtml(count);
  const tmp = join(tmpdir(), `print_test_${Date.now()}.html`);
  writeFileSync(tmp, html, "utf-8");
  await page.goto(`file://${tmp}`, { waitUntil: "load" });
  unlinkSync(tmp);
}

test.describe("PrintLayout", () => {
  test("renders cards in page containers with flexbox layout", async ({
    page,
  }) => {
    await loadHtml(page, 9);

    const pages = page.locator(".print-page");
    await expect(pages).toHaveCount(1);

    const display = await pages
      .first()
      .evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe("flex");

    const cards = page.locator("body img");
    await expect(cards).toHaveCount(9);
  });

  test("splits cards across multiple pages at 9 per page", async ({
    page,
  }) => {
    await loadHtml(page, 12);

    const pages = page.locator(".print-page");
    await expect(pages).toHaveCount(2);

    const cardsPage1 = pages.first().locator(".print-card");
    await expect(cardsPage1).toHaveCount(9);

    const cardsPage2 = pages.nth(1).locator(".print-card");
    await expect(cardsPage2).toHaveCount(3);
  });

  test("each card has 8 crop marks (4 corners × 2 lines)", async ({
    page,
  }) => {
    await loadHtml(page, 3);

    // 3 cards × 8 marks each = 24
    const marks = page.locator(".crop-mark");
    await expect(marks).toHaveCount(24);
  });

  test("crop marks are hidden on screen", async ({ page }) => {
    await loadHtml(page, 1);

    const marks = page.locator(".crop-mark");
    const count = await marks.count();
    expect(count).toBe(8);

    for (let i = 0; i < count; i++) {
      const display = await marks
        .nth(i)
        .evaluate((el) => getComputedStyle(el).display);
      expect(display).toBe("none");
    }
  });

  test("crop marks are visible in print", async ({ page }) => {
    await loadHtml(page, 1);
    await page.emulateMedia({ media: "print" });

    const marks = page.locator(".crop-mark");
    const count = await marks.count();
    expect(count).toBe(8);

    for (let i = 0; i < count; i++) {
      const display = await marks
        .nth(i)
        .evaluate((el) => getComputedStyle(el).display);
      expect(display).not.toBe("none");
    }
  });

  test("visual: screenshot with crop marks in print mode", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 794, height: 1123 });
    await loadHtml(page, 9);
    await page.emulateMedia({ media: "print" });
    await page.screenshot({
      path: "test-results/print-layout.png",
      fullPage: true,
    });
  });

  test("cards layout forms a 3x3 grid with gaps", async ({ page }) => {
    await page.setViewportSize({ width: 794, height: 1123 });
    await loadHtml(page, 9);

    const cards = page.locator(".print-page > .print-card");
    const boxes = [];
    for (let i = 0; i < 9; i++) {
      boxes.push(await cards.nth(i).boundingBox());
    }

    // 3 columns: row alignment
    expect(boxes[0]!.y).toBeCloseTo(boxes[1]!.y, 0);
    expect(boxes[1]!.y).toBeCloseTo(boxes[2]!.y, 0);
    expect(boxes[3]!.y).toBeCloseTo(boxes[4]!.y, 0);

    // Column alignment
    expect(boxes[0]!.x).toBeCloseTo(boxes[3]!.x, 0);

    // 3 rows
    expect(boxes[6]!.x).toBeCloseTo(boxes[0]!.x, 0);

    // Gap ~2.5mm (≈9.4px at 96dpi)
    const gapV = boxes[3]!.y - (boxes[0]!.y + boxes[0]!.height);
    expect(gapV).toBeGreaterThan(6);
    expect(gapV).toBeLessThan(14);

    const gapH = boxes[1]!.x - (boxes[0]!.x + boxes[0]!.width);
    expect(gapH).toBeGreaterThan(6);
    expect(gapH).toBeLessThan(14);
  });
});
