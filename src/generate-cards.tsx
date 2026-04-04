import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { program } from "commander";
import { PrintLayout } from "./components/print/PrintLayout.js";
import { buildCardMap } from "./utils/load-cards.js";
import { renderCardHtml } from "./utils/render-card-html.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cardCss = readFileSync(join(__dirname, "styles/card.css"), "utf-8");

function main() {
  program
    .option("-i, --input <path>", "Path to cards.json or directory", "card-db")
    .option("-o, --output <path>", "Output directory", "out_cards")
    .parse();

  const opts = program.opts();
  const outDir = resolve(opts.output);
  mkdirSync(outDir, { recursive: true });

  const cardMap = buildCardMap(opts.input);
  const made: string[] = [];

  for (const [filename, card] of cardMap) {
    const html = renderCardHtml(card, cardCss, { embedArt: true });
    writeFileSync(join(outDir, filename), html, "utf-8");
    made.push(filename);
  }

  // Generate an HTML index using the same PrintLayout as collect-and-print
  const groups = new Map<string, string[]>();
  for (const filename of made) {
    let cat = "Items";
    if (filename.startsWith("spell_")) cat = "Spells";
    else if (filename.startsWith("monster_")) cat = "Monsters";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(filename);
  }

  const markup = renderToStaticMarkup(
    <PrintLayout
      groups={Array.from(groups.entries()).map(([category, cardPaths]) => ({
        category,
        cardPaths,
      }))}
      cardCss={cardCss}
    />,
  );

  const indexHtml = `<!DOCTYPE html>\n${markup}`.replace(
    "<head>",
    '<head><meta charset="utf-8">',
  );

  const htmlPath = join(outDir, "index.html");
  writeFileSync(htmlPath, indexHtml, "utf-8");

  console.log(`\nGenerated ${made.length} cards into: ${outDir}`);
  console.log(`HTML index: ${htmlPath}`);
  for (const name of made) {
    console.log(` - ${name}`);
  }
}

main();
