/**
 * Helper script invoked via `tsx` to generate test HTML.
 * Usage: tsx tests/render-html.tsx <count>
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { resolve, join, dirname } from "node:path";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PrintLayout } from "../src/components/print/PrintLayout.js";

const count = parseInt(process.argv[2] ?? "9", 10);

const cardsDir = resolve(import.meta.dirname, "../out_cards");
const cardPaths = readdirSync(cardsDir)
  .filter((f) => f.endsWith(".html") && f !== "index.html")
  .sort()
  .slice(0, count)
  .map((f) => `file://${resolve(cardsDir, f)}`);

const srcDir = resolve(import.meta.dirname, "../src");
const cardCss = readFileSync(join(srcDir, "styles/card.css"), "utf-8");

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
