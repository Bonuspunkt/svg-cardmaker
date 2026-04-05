/**
 * Helper script invoked via `vite-node` to generate test HTML.
 * Usage: vite-node tests/render-html.tsx <count>
 *
 * Uses buildCardMap to generate card filenames directly from card-db,
 * avoiding a dependency on the out_cards/ directory.
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { resolve, join } from "node:path";
import { readFileSync } from "node:fs";
import { PrintLayout } from "../src/components/print/PrintLayout.js";
import { buildCardMap } from "../src/utils/load-cards.js";

const count = parseInt(process.argv[2] ?? "9", 10);

const projectRoot = resolve(import.meta.dirname, "..");
const cardCss = readFileSync(join(projectRoot, "src/styles/card.css"), "utf-8");

const cardMap = buildCardMap(join(projectRoot, "card-db"));
const cardPaths = Array.from(cardMap.keys())
  .sort()
  .slice(0, count)
  .map((f) => `cards/${f}`);

const markup = renderToStaticMarkup(
  <PrintLayout
    groups={[{ category: "Items", cardPaths }]}
    cardCss={cardCss}
  />,
);

const html = `<!DOCTYPE html>\n${markup}`.replace(
  "<head>",
  '<head><meta charset="utf-8">',
);

process.stdout.write(html);
