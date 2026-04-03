import { readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { program } from "commander";
import puppeteer from "puppeteer";

// Unit conversions
function pxToPt(px: number, dpi: number): number {
  return (px * 72.0) / dpi;
}

function a4SizePt(orientation: string): [number, number] {
  const wPt = 595.2755906;
  const hPt = 841.8897638;
  if (orientation === "a4portrait") return [wPt, hPt];
  return [hPt, wPt]; // landscape
}

interface Position {
  x: number;
  y: number;
}

function layoutPositionsPt(
  sheetW: number,
  sheetH: number,
  cardW: number,
  cardH: number,
  cols: number,
  rows: number,
  gutterPt: number,
): Position[] {
  const positions: Position[] = [];

  const totalW = cols * cardW + (cols - 1) * gutterPt;
  const totalH = rows * cardH + (rows - 1) * gutterPt;

  const x0 = (sheetW - totalW) / 2;
  // For CSS/HTML, y=0 is top, so we compute top-left positions
  const y0 = (sheetH - totalH) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * (cardW + gutterPt);
      const y = y0 + r * (cardH + gutterPt);
      positions.push({ x, y });
    }
  }

  return positions;
}

function collectFiles(
  cardsDir: string,
  requests: Array<[string, number]>,
): string[] {
  const index = new Map<string, string>();
  const dir = resolve(cardsDir);
  for (const f of readdirSync(dir)) {
    if (f.endsWith(".svg")) {
      const stem = f.replace(/\.svg$/, "").toLowerCase();
      index.set(stem, join(dir, f));
    }
  }

  const out: string[] = [];
  for (const [base, count] of requests) {
    const key = base.toLowerCase();
    const path = index.get(key);
    if (!path) {
      throw new Error(`Card SVG '${base}.svg' not found in ${cardsDir}`);
    }
    for (let i = 0; i < count; i++) {
      out.push(path);
    }
  }
  return out;
}

function parseAdds(addList: string[]): Array<[string, number]> {
  const out: Array<[string, number]> = [];
  for (const item of addList) {
    if (!item.includes("=")) {
      throw new Error(`--add expects 'Name=count', got: ${item}`);
    }
    const [name, cntStr] = item.split("=", 2);
    const cnt = parseInt(cntStr, 10);
    if (cnt <= 0) continue;
    out.push([name.trim(), cnt]);
  }
  return out;
}

function buildCropMarksHtml(
  x: number,
  y: number,
  w: number,
  h: number,
  lenPt: number,
  offsetPt: number,
): string {
  const lines: string[] = [];
  const style = `position:absolute;background:#000;`;

  // Bottom-left corner
  lines.push(
    `<div style="${style}left:${x - offsetPt - lenPt}pt;top:${y - offsetPt}pt;width:${lenPt}pt;height:0.5pt;"></div>`,
  );
  lines.push(
    `<div style="${style}left:${x - offsetPt}pt;top:${y - offsetPt - lenPt}pt;width:0.5pt;height:${lenPt}pt;"></div>`,
  );

  // Bottom-right corner
  lines.push(
    `<div style="${style}left:${x + w + offsetPt}pt;top:${y - offsetPt}pt;width:${lenPt}pt;height:0.5pt;"></div>`,
  );
  lines.push(
    `<div style="${style}left:${x + w + offsetPt}pt;top:${y - offsetPt - lenPt}pt;width:0.5pt;height:${lenPt}pt;"></div>`,
  );

  // Top-left corner
  lines.push(
    `<div style="${style}left:${x - offsetPt - lenPt}pt;top:${y + h + offsetPt}pt;width:${lenPt}pt;height:0.5pt;"></div>`,
  );
  lines.push(
    `<div style="${style}left:${x - offsetPt}pt;top:${y + h + offsetPt}pt;width:0.5pt;height:${lenPt}pt;"></div>`,
  );

  // Top-right corner
  lines.push(
    `<div style="${style}left:${x + w + offsetPt}pt;top:${y + h + offsetPt}pt;width:${lenPt}pt;height:0.5pt;"></div>`,
  );
  lines.push(
    `<div style="${style}left:${x + w + offsetPt}pt;top:${y + h + offsetPt}pt;width:0.5pt;height:${lenPt}pt;"></div>`,
  );

  return lines.join("\n");
}

async function makeSheets(
  svgPaths: string[],
  outPdf: string,
  dpi: number = 300,
  orientation: string = "a4portrait",
  cols: number = 3,
  rows: number = 3,
  gutterPx: number = 18,
  cardW: number = 744,
  cardH: number = 1039,
  addCrop: boolean = false,
) {
  const gutterPt = pxToPt(gutterPx, dpi);
  const cardWPt = pxToPt(cardW, dpi);
  const cardHPt = pxToPt(cardH, dpi);
  const [sheetWPt, sheetHPt] = a4SizePt(orientation);

  const positions = layoutPositionsPt(
    sheetWPt,
    sheetHPt,
    cardWPt,
    cardHPt,
    cols,
    rows,
    gutterPt,
  );

  const perPage = cols * rows;
  const cropLenPt = pxToPt(28, dpi);
  const cropOffsetPt = pxToPt(8, dpi);

  // Build HTML pages
  const pages: string[] = [];

  for (let i = 0; i < svgPaths.length; i += perPage) {
    const chunk = svgPaths.slice(i, i + perPage);
    let pageHtml = `<div class="page" style="position:relative;width:${sheetWPt}pt;height:${sheetHPt}pt;page-break-after:always;">`;

    for (let j = 0; j < chunk.length; j++) {
      const svgContent = readFileSync(chunk[j], "utf-8");
      const { x, y } = positions[j];

      pageHtml += `<div style="position:absolute;left:${x}pt;top:${y}pt;width:${cardWPt}pt;height:${cardHPt}pt;overflow:hidden;">`;
      pageHtml += svgContent
        .replace(/<\?xml[^?]*\?>\s*/, "")
        .replace(/width="[^"]*"/, `width="${cardWPt}pt"`)
        .replace(/height="[^"]*"/, `height="${cardHPt}pt"`);
      pageHtml += `</div>`;

      if (addCrop) {
        pageHtml += buildCropMarksHtml(
          x,
          y,
          cardWPt,
          cardHPt,
          cropLenPt,
          cropOffsetPt,
        );
      }
    }

    pageHtml += `</div>`;
    pages.push(pageHtml);
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<style>
  @page { size: ${sheetWPt}pt ${sheetHPt}pt; margin: 0; }
  * { margin: 0; padding: 0; }
  body { margin: 0; padding: 0; }
</style>
</head>
<body>
${pages.join("\n")}
</body>
</html>`;

  // Use Puppeteer to render to PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.pdf({
    path: resolve(outPdf),
    width: `${sheetWPt}pt`,
    height: `${sheetHPt}pt`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await browser.close();

  console.log(`Created: ${outPdf}`);
}

async function main() {
  program
    .option("--cards <dir>", "Directory with SVG cards", "cards")
    .option(
      "--add <items...>",
      "Add 'Name=count' (use base filename without .svg). Can repeat.",
    )
    .option("--out <path>", "Output PDF path", "cards_print.pdf")
    .option("--dpi <n>", "Interpretation DPI for px-based inputs", "300")
    .option(
      "--orientation <type>",
      "Sheet orientation",
      "a4portrait",
    )
    .option("--cols <n>", "Columns per page", "3")
    .option("--rows <n>", "Rows per page", "3")
    .option("--margin <n>", "Outer margin in px (at sheet DPI)", "60")
    .option("--gutter <n>", "Gap between cards in px (at sheet DPI)", "18")
    .option("--card-w <n>", "Card width in px", "744")
    .option("--card-h <n>", "Card height in px", "1039")
    .option("--crop", "Add crop marks around each card")
    .parse();

  const opts = program.opts();
  const addList: string[] = opts.add ?? [];

  if (addList.length === 0) {
    console.error("Please add at least one --add 'Name=count'");
    process.exit(1);
  }

  const requests = parseAdds(addList);
  const svgList = collectFiles(opts.cards, requests);

  await makeSheets(
    svgList,
    opts.out,
    parseInt(opts.dpi),
    opts.orientation,
    parseInt(opts.cols),
    parseInt(opts.rows),
    parseInt(opts.gutter),
    parseInt(opts.cardW),
    parseInt(opts.cardH),
    opts.crop ?? false,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
