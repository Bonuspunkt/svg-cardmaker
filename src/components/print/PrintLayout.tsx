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

export function PrintLayout({ groups, cardCss }: PrintLayoutProps) {
  const cards = interleaveCards(groups);

  return (
    <html>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @page { size: A4; margin: 0; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              @media screen { .crop-mark { display: none; } }
              iframe.card-frame { border: none; }
              .print-body { display: flex; flex-wrap: wrap; align-content: center; justify-content: center; gap: 0.5cm; }
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
      <body className="print-body">
        {cards.map((card, i) => (
          <div key={`${card.category}-${i}`} className="print-card">
            <img className="card-frame" src={card.cardPath} />
            <CropMarks />
          </div>
        ))}
      </body>
    </html>
  );
}
