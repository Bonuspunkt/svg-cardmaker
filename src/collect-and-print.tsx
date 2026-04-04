import { readFileSync, readdirSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { program } from "commander";
import puppeteer from "puppeteer";
import { PrintLayout } from "./components/print/PrintLayout.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cardCss = readFileSync(join(__dirname, "styles/card.css"), "utf-8");

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
    .filter((f) => f.endsWith(".html") && f !== "index.html")
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
    if (f.endsWith(".html") && f !== "index.html") {
      const stem = f.replace(/\.html$/, "").toLowerCase();
      index.set(stem, join(dir, f));
    }
  }

  const out: string[] = [];
  for (const [base, count] of requests) {
    const key = base.toLowerCase();
    const path = index.get(key);
    if (!path) {
      throw new Error(`Card '${base}.html' not found in ${cardsDir}`);
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
  cardGroups: Map<string, string[]>,
  outPdf: string,
) {
  const [sheetWPt, sheetHPt] = a4SizePt("a4portrait");

  const groups = Array.from(cardGroups.entries()).map(([category, paths]) => ({
    category,
    cardPaths: paths.map((p) => `file://${resolve(p)}`),
  }));

  const markup = renderToStaticMarkup(
    <PrintLayout groups={groups} cardCss={cardCss} />,
  );

  const html = `<!DOCTYPE html>\n${markup}`.replace(
    "<head>",
    '<head><meta charset="utf-8">',
  );

  const tmpHtml = join(tmpdir(), `cards_print_${Date.now()}.html`);
  writeFileSync(tmpHtml, html, "utf-8");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(`file://${tmpHtml}`, { waitUntil: "networkidle0" });
  await page.pdf({
    path: resolve(outPdf),
    width: `${sheetWPt}pt`,
    height: `${sheetHPt}pt`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await browser.close();
  unlinkSync(tmpHtml);

  console.log(`Created: ${outPdf}`);
}

async function main() {
  program
    .option("--cards <dir>", "Directory with HTML cards", "cards")
    .option(
      "--add <items...>",
      "Add 'Name=count' (use base filename without .html). Can repeat.",
    )
    .option("--out <path>", "Output PDF path", "cards_print.pdf")
    .option("--all", "Include one of every card in the cards directory")
    .parse();

  const opts = program.opts();
  const addList: string[] = opts.add ?? [];

  if (!opts.all && addList.length === 0) {
    console.error("Please use --all or add at least one --add 'Name=count'");
    process.exit(1);
  }

  let cardGroups: Map<string, string[]>;
  if (opts.all) {
    cardGroups = collectAllFiles(opts.cards);
  } else {
    cardGroups = new Map<string, string[]>();
  }
  if (addList.length > 0) {
    const requests = parseAdds(addList);
    const extra = collectFiles(opts.cards, requests);
    for (const path of extra) {
      const cat = categorizeFile(path.split("/").pop()!);
      if (!cardGroups.has(cat)) cardGroups.set(cat, []);
      cardGroups.get(cat)!.push(path);
    }
  }

  await makeSheets(cardGroups, opts.out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
