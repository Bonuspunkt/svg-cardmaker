import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { program } from "commander";
import { Card } from "./components/Card.js";
import { PrintLayout } from "./components/print/PrintLayout.js";
import { safeFilename } from "./utils/filename.js";
import type { Card as CardType } from "./types/card.js";
import { isSpellCard, isMonsterCard } from "./types/card.js";

function loadCards(inputPath: string): CardType[] {
  const cards: CardType[] = [];
  const resolved = resolve(inputPath);
  const stat = statSync(resolved);

  if (stat.isFile()) {
    const data = JSON.parse(readFileSync(resolved, "utf-8"));
    cards.push(...(data.cards ?? []));
  } else if (stat.isDirectory()) {
    const files = readdirSync(resolved)
      .filter((f) => f.endsWith(".json"))
      .sort();
    for (const file of files) {
      try {
        const data = JSON.parse(
          readFileSync(join(resolved, file), "utf-8"),
        );
        const cardsInFile = data.cards ?? [];
        cards.push(...cardsInFile);
        console.log(`Loaded ${cardsInFile.length} cards from ${file}`);
      } catch (e) {
        console.error(`Error in ${file}: ${e}`);
      }
    }
  }

  return cards;
}

function generateSvg(card: CardType): string {
  const markup = renderToStaticMarkup(<Card card={card} />);
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${markup}\n`;
}

function main() {
  program
    .option("-i, --input <path>", "Path to cards.json or directory", "card-db")
    .option("-o, --output <path>", "Output directory", "out_cards")
    .parse();

  const opts = program.opts();
  const cards = loadCards(opts.input);
  const outDir = resolve(opts.output);

  mkdirSync(outDir, { recursive: true });

  const made: string[] = [];

  for (const card of cards) {
    const safe = safeFilename(card.name ?? "card");
    let filename: string;

    if (isSpellCard(card)) {
      filename = `spell_${safe}.svg`;
    } else if (isMonsterCard(card)) {
      filename = `monster_${safe}.svg`;
    } else {
      filename = `${safe}.svg`;
    }

    const svg = generateSvg(card);
    const outPath = join(outDir, filename);
    writeFileSync(outPath, svg, "utf-8");
    made.push(filename);
  }

  // Generate an HTML index using the same PrintLayout as collect-and-print
  const groups = new Map<string, string[]>();
  for (const filename of made) {
    let cat = "Items";
    if (filename.startsWith("spell_")) cat = "Spells";
    else if (filename.startsWith("monster_")) cat = "Monsters";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(`<img src="${filename}" style="width:100%;height:100%" />`);
  }

  const markup = renderToStaticMarkup(
    <PrintLayout
      groups={Array.from(groups.entries()).map(([category, svgContents]) => ({
        category,
        svgContents,
      }))}
      showCropMarks={false}
    />,
  );

  const html = `<!DOCTYPE html>\n${markup}`.replace(
    "<head>",
    '<head><meta charset="utf-8">',
  );

  const htmlPath = join(outDir, "index.html");
  writeFileSync(htmlPath, html, "utf-8");

  console.log(`\nGenerated ${made.length} cards into: ${outDir}`);
  console.log(`HTML index: ${htmlPath}`);
  for (const name of made) {
    console.log(` - ${name}`);
  }
}

main();
