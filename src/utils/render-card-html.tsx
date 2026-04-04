import { renderToStaticMarkup } from "react-dom/server";
import { Card } from "../components/Card.js";
import type { Card as CardType } from "../types/card.js";
import { isItemCard, isMonsterCard } from "../types/card.js";
import { dataUriForImage } from "./image.js";

export function resolveArt(card: CardType): CardType {
  if (isItemCard(card) && card.art_path && !card.art_src) {
    return { ...card, art_src: dataUriForImage(card.art_path) };
  }
  if (isMonsterCard(card) && !card.art_src) {
    const artPath = card.art_path ?? "art/dickbutt.svg";
    return { ...card, art_src: dataUriForImage(artPath) };
  }
  return card;
}

export function renderCardHtml(
  card: CardType,
  css: string,
  opts?: { embedArt?: boolean },
): string {
  const processed = opts?.embedArt ? resolveArt(card) : card;
  const markup = renderToStaticMarkup(<Card card={processed} />);
  const base = opts?.embedArt ? "" : '<base href="/">';
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">${base}<style>${css}</style></head>
<body style="margin:0">${markup}</body>
</html>`;
}
