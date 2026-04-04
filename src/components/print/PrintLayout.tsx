import React from "react";
import { CropMarks } from "./CropMarks.js";

export interface CardGroup {
  category: string;
  cardPaths: string[];
}

export interface PrintLayoutProps {
  groups: CardGroup[];
  cardCss?: string;
}

const CATEGORY_ORDER = ["Items", "Monsters", "Spells"];
const CARDS_PER_PAGE = 9; // 3 columns × 3 rows

function interleaveCards(groups: CardGroup[]): { category: string; cardPath: string }[] {
  const byCategory = new Map<string, string[]>();
  for (const group of groups) {
    const existing = byCategory.get(group.category) ?? [];
    byCategory.set(group.category, [...existing, ...group.cardPaths]);
  }

  const ordered = CATEGORY_ORDER.filter((cat) => byCategory.has(cat));
  const queues = ordered.map((cat) => [...byCategory.get(cat)!]);
  const result: { category: string; cardPath: string }[] = [];

  while (queues.some((q) => q.length > 0)) {
    for (let i = 0; i < ordered.length; i++) {
      if (queues[i].length > 0) {
        result.push({ category: ordered[i], cardPath: queues[i].shift()! });
      }
    }
  }

  return result;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    pages.push(arr.slice(i, i + size));
  }
  return pages;
}

export function PrintLayout({ groups, cardCss }: PrintLayoutProps) {
  const cards = interleaveCards(groups);
  const pages = chunk(cards, CARDS_PER_PAGE);

  return (
    <html>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @page { size: A4; margin: 1.15cm 0; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              @media screen { .crop-mark { display: none; } }
              iframe.card-frame { border: none; }
              .print-page { width: 21cm; height: 29.7cm; display: flex; flex-wrap: wrap; align-content: center; justify-content: center; gap: 0.25cm; break-after: page; }
              .print-page:last-child { break-after: auto; }
              .print-card { position: relative; width: 6.3cm; height: 8.8cm; break-inside: avoid; }
              .print-card img { width: 6.3cm; height: 8.8cm; }
              .crop-x { position: absolute; width: 0.3cm; height: 0.3cm; transform: translate(-50%, -50%); }
              .crop-line { position: absolute; left: 0; top: 50%; width: 100%; height: 0.02cm; background: #000; transform-origin: center; }
              .crop-line-v { transform: translateY(-50%) rotate(90deg); }
              .crop-line-h { transform: translateY(-50%); }
              ${cardCss ?? ""}
            `,
          }}
        />
      </head>
      <body>
        {pages.map((page, pi) => (
          <div key={pi} className="print-page">
            {page.map((card, ci) => (
              <div key={`${card.category}-${ci}`} className="print-card">
                <img className="card-frame" src={card.cardPath} />
                <CropMarks />
              </div>
            ))}
          </div>
        ))}
      </body>
    </html>
  );
}
