import { useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Card } from "./components/Card.js";
import { CropMarks } from "./components/print/CropMarks.js";
import type { Card as CardType } from "./types/card.js";
import { isSpellCard, isMonsterCard } from "./types/card.js";
import { expandCard } from "./utils/expand-card.js";
import {
  estimateMonsterContentLines,
  estimateItemContentLines,
  TENT_SINGLE_CARD_LINES,
  TENT_ITEM_SINGLE_CARD_LINES,
  TENT_ITEM_DOUBLE_CARD_LINES,
} from "./utils/expand-card.js";
import { CARD_HEIGHT } from "./theme/layout.js";
import "./styles/card.css";
import styles from "./styles/preview.module.css";

const cardModules = import.meta.glob("../card-db/*.json", { eager: true }) as Record<
  string,
  { cards?: CardType[] }
>;

const rawCards: CardType[] = Object.values(cardModules)
  .flatMap((mod) => mod.cards ?? []);

function getCardGroup(card: CardType): string {
  if (isSpellCard(card)) return "Spells";
  if (isMonsterCard(card)) return "Monsters";
  if ((card.type_line ?? "").includes("Weapon")) return "Weapons";
  return "Items";
}

function toId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const COLS = 3;
const GAP = 0.25; // cm
const PAGE_H = 29.7; // A4 height in cm

function getCardHeight(card: CardType, tentMode: boolean): number {
  if (tentMode && isMonsterCard(card)) {
    const lines = estimateMonsterContentLines(card);
    const bottomCards = lines <= TENT_SINGLE_CARD_LINES ? 1 : 2;
    return CARD_HEIGHT + CARD_HEIGHT * bottomCards;
  }
  if (tentMode && !isSpellCard(card) && !isMonsterCard(card) && !card.portrait && !card.continuation) {
    const itemCard = card as import("./types/card.js").ItemCard;
    const lines = estimateItemContentLines(itemCard);
    if (lines > TENT_ITEM_SINGLE_CARD_LINES) {
      const count = lines <= TENT_ITEM_DOUBLE_CARD_LINES ? 2 : 3;
      return CARD_HEIGHT * count;
    }
  }
  return CARD_HEIGHT;
}

function paginateCards(cards: CardType[], tentMode: boolean): CardType[][] {
  const pages: CardType[][] = [];
  let page: CardType[] = [];
  let row: CardType[] = [];
  let usedH = 0;

  for (const card of cards) {
    row.push(card);
    if (row.length === COLS) {
      const rowH = Math.max(...row.map((c) => getCardHeight(c, tentMode)));
      const needed = usedH === 0 ? rowH : rowH + GAP;
      if (usedH + needed > PAGE_H && page.length > 0) {
        pages.push(page);
        page = [...row];
        usedH = rowH;
      } else {
        page.push(...row);
        usedH += needed;
      }
      row = [];
    }
  }
  if (row.length > 0) {
    const rowH = Math.max(...row.map((c) => getCardHeight(c, tentMode)));
    const needed = usedH === 0 ? rowH : rowH + GAP;
    if (usedH + needed > PAGE_H && page.length > 0) {
      pages.push(page);
      page = [...row];
    } else {
      page.push(...row);
    }
  }
  if (page.length > 0) pages.push(page);
  return pages;
}

function App() {
  const [tentMode, setTentMode] = useState(true);

  const groupEntries = useMemo(() => {
    const allCardPages: CardType[][] = rawCards.map((card) => expandCard(card, tentMode));

    const grouped = new Map<string, CardType[][]>();
    for (const pages of allCardPages) {
      const group = pages.some(isMonsterCard) ? "Monsters"
        : pages.some(isSpellCard) ? "Spells"
        : getCardGroup(pages[0]);
      if (!grouped.has(group)) grouped.set(group, []);
      grouped.get(group)!.push(pages);
    }

    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [tentMode]);

  const printCards = useMemo(() =>
    rawCards.flatMap((card) => expandCard(card, tentMode)),
    [tentMode],
  );

  const printPages = useMemo(() => paginateCards(printCards, tentMode), [printCards, tentMode]);

  return (
    <>
      <nav className={`no-print ${styles.nav}`}>
        {groupEntries.map(([name]) => (
          <a
            key={name}
            href={`#${toId(name)}`}
            className={styles.navLink}
          >
            {name}
          </a>
        ))}
        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleOption} ${tentMode ? styles.toggleOptionActive : ""}`}
            onClick={() => setTentMode(true)}
          >
            Tent Card
          </button>
          <button
            className={`${styles.toggleOption} ${!tentMode ? styles.toggleOptionActive : ""}`}
            onClick={() => setTentMode(false)}
          >
            Multi-Page
          </button>
        </div>
      </nav>
      <div className={`no-print ${styles.content}`}>
        {groupEntries.map(([name, cards]) => (
          <section key={name} id={toId(name)} className={styles.section}>
            <h2 className={styles.sectionHeading}>
              {name} ({cards.length}{cards.length === 1 ? " card" : " cards"})
            </h2>
            <div className={styles.cardGrid}>
              {cards.map((pages, i) => (
                <div key={i} className={styles.cardGroup}>
                  {pages.map((card, j) => (
                    <Card key={j} card={card} tentMode={tentMode} />
                  ))}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="print-only">
        {printPages.map((page, pi) => (
          <div key={pi} className="print-page">
            {page.map((card, ci) => (
              <div key={ci} className="print-card">
                <Card card={card} tentMode={tentMode} />
                <CropMarks />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
