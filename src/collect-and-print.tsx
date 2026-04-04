import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { program } from "commander";
import puppeteer from "puppeteer";
import { PrintLayout } from "./components/print/PrintLayout.js";

function pxToPt(px: number, dpi: number): number {
  return (px * 72.0) / dpi;
}

function a4SizePt(orientation: string): [number, number] {
  const wPt = 595.2755906;
  const hPt = 841.8897638;
  if (orientation === "a4portrait") return [wPt, hPt];
  return [hPt, wPt];
}

function categorizeFile(filename: string): string {
  if (filename.startsWith("spell_")) return "Spells";
  if (filename.startsWith("monster_")) return "Monsters";
  return "Items";
}

function collectAllFiles(cardsDir: string): Map<string, string[]> {
  const dir = resolve(cardsDir);
  const groups = new Map<string, string[]>();
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".svg"))
    .sort();

  for (const f of files) {
    const cat = categorizeFile(f);
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(join(dir, f));
  }

  return groups;
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

async function makeSheets(
  svgGroups: Map<string, string[]>,
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

  const groups = Array.from(svgGroups.entries()).map(([category, paths]) => ({
    category,
    svgContents: paths.map((p) => readFileSync(p, "utf-8")),
  }));

  const markup = renderToStaticMarkup(
    <PrintLayout
      groups={groups}
      sheetWidthPt={sheetWPt}
      sheetHeightPt={sheetHPt}
      cardWidthPt={cardWPt}
      cardHeightPt={cardHPt}
      cols={cols}
      rows={rows}
      gutterPt={gutterPt}
      showCropMarks={addCrop}
      dpi={dpi}
    />,
  );

  const html = `<!DOCTYPE html>\n${markup}`.replace(
    "<head>",
    '<head><meta charset="utf-8">',
  );

  const htmlPath = outPdf.replace(/\.pdf$/, ".html");
  writeFileSync(resolve(htmlPath), html, "utf-8");
  console.log(`Created: ${htmlPath}`);

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
    .option("--orientation <type>", "Sheet orientation", "a4portrait")
    .option("--cols <n>", "Columns per page", "3")
    .option("--rows <n>", "Rows per page", "3")
    .option("--margin <n>", "Outer margin in px (at sheet DPI)", "60")
    .option("--gutter <n>", "Gap between cards in px (at sheet DPI)", "18")
    .option("--card-w <n>", "Card width in px", "744")
    .option("--card-h <n>", "Card height in px", "1039")
    .option("--crop", "Add crop marks around each card")
    .option("--all", "Include one of every SVG card in the cards directory")
    .parse();

  const opts = program.opts();
  const addList: string[] = opts.add ?? [];

  if (!opts.all && addList.length === 0) {
    console.error("Please use --all or add at least one --add 'Name=count'");
    process.exit(1);
  }

  let svgGroups: Map<string, string[]>;
  if (opts.all) {
    svgGroups = collectAllFiles(opts.cards);
  } else {
    svgGroups = new Map<string, string[]>();
  }
  if (addList.length > 0) {
    const requests = parseAdds(addList);
    const extra = collectFiles(opts.cards, requests);
    for (const path of extra) {
      const cat = categorizeFile(path.split("/").pop()!);
      if (!svgGroups.has(cat)) svgGroups.set(cat, []);
      svgGroups.get(cat)!.push(path);
    }
  }

  await makeSheets(
    svgGroups,
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
