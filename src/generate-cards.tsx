import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { program } from "commander";
import { Card } from "./components/Card.js";
import { PrintLayout } from "./components/print/PrintLayout.js";
import { safeFilename } from "./utils/filename.js";
import type { Card as CardType } from "./types/card.js";
import { isSpellCard, isMonsterCard, isItemCard } from "./types/card.js";
import { dataUriForImage } from "./utils/image.js";
import { expandCard } from "./utils/expand-card.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cardCss = readFileSync(join(__dirname, "styles/card.css"), "utf-8");

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

function resolveArt(card: CardType): CardType {
  if (isItemCard(card) && card.art_path && !card.art_src) {
    return { ...card, art_src: dataUriForImage(card.art_path) };
  }
  if (isMonsterCard(card) && !card.art_src) {
    const artPath = card.art_path ?? "art/dickbutt.svg";
    return { ...card, art_src: dataUriForImage(artPath) };
  }
  return card;
}

function generateHtml(card: CardType): string {
  const markup = renderToStaticMarkup(<Card card={resolveArt(card)} />);
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>${cardCss}</style></head>
<body style="margin:0">${markup}</body>
</html>`;
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
    const expanded = expandCard(card);
    for (const [idx, c] of expanded.entries()) {
      const safe = safeFilename(c.name ?? "card");
      let filename: string;

      if (isSpellCard(c)) {
        filename = `spell_${safe}.html`;
      } else if (isMonsterCard(c)) {
        filename = `monster_${safe}.html`;
      } else {
        filename = `${safe}.html`;
      }

      // Avoid filename collisions for continuation cards
      if (idx > 0) {
        filename = filename.replace(/\.html$/, `_p${idx + 1}.html`);
      }

      const html = generateHtml(c);
      const outPath = join(outDir, filename);
      writeFileSync(outPath, html, "utf-8");
      made.push(filename);
    }
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
