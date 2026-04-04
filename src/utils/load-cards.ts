import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import type { Card as CardType } from "../types/card.js";
import { isSpellCard, isMonsterCard } from "../types/card.js";
import { safeFilename } from "./filename.js";
import { expandCard } from "./expand-card.js";

export function loadCards(inputPath: string): CardType[] {
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
        const data = JSON.parse(readFileSync(join(resolved, file), "utf-8"));
        cards.push(...(data.cards ?? []));
      } catch (e) {
        console.error(`Error in ${file}: ${e}`);
      }
    }
  }

  return cards;
}

export function cardFilename(card: CardType, pageIndex: number): string {
  const safe = safeFilename(card.name ?? "card");
  let filename: string;

  if (isSpellCard(card)) {
    filename = `spell_${safe}.html`;
  } else if (isMonsterCard(card)) {
    filename = `monster_${safe}.html`;
  } else {
    filename = `${safe}.html`;
  }

  if (pageIndex > 0) {
    filename = filename.replace(/\.html$/, `_p${pageIndex + 1}.html`);
  }

  return filename;
}

export function buildCardMap(
  inputPath: string,
  tentMode?: boolean,
): Map<string, CardType> {
  const cards = loadCards(inputPath);
  const map = new Map<string, CardType>();

  for (const card of cards) {
    const expanded = expandCard(card, tentMode);
    for (const [idx, c] of expanded.entries()) {
      map.set(cardFilename(c, idx), c);
    }
  }

  return map;
}
