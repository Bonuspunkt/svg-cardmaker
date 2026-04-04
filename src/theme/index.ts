import type { Theme } from "../types/theme.js";
import { rarityColors } from "./colors.js";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  OUTER_PADDING,
  INNER_PADDING,
  INNER_WIDTH,
  TITLE_H,
  ART_H,
  TYPE_H_ITEM,
  TYPE_H_SPELL,
  TYPE_H_MONSTER,
  RULES_H_ITEM,
  RULES_H_SPELL,
  RULES_H_MONSTER,
  OPT_H,
  FONT_SIZE_TITLE,
  FONT_SIZE_RULE,
  FONT_SIZE_FOOTER,
  FONT_SERIF,
  FONT_SANS,
  FONT_MONO,
} from "./layout.js";

export function getTheme(
  overrides: Record<string, string | number>,
  rarity: string,
  cardType: "item" | "spell" | "monster",
): Theme {
  // Compute vertical positions based on card type
  let artY = INNER_PADDING + TITLE_H + 6;
  let typeY: number;
  let typeH: number;
  let rulesY: number;
  let rulesH: number;

  if (cardType === "spell") {
    typeY = INNER_PADDING + TITLE_H + 6;
    typeH = TYPE_H_SPELL;
    rulesY = typeY + typeH + 6;
    rulesH = RULES_H_SPELL;
  } else if (cardType === "monster") {
    typeY = INNER_PADDING + TITLE_H + 6;
    typeH = TYPE_H_MONSTER;
    rulesY = typeY + typeH + 6;
    rulesH = RULES_H_MONSTER;
  } else {
    typeY = artY + ART_H + 6;
    typeH = TYPE_H_ITEM;
    rulesY = typeY + typeH + 6;
    rulesH = RULES_H_ITEM;
  }

  const optY = rulesY + rulesH + 6;

  const theme: Theme = {
    // Colors
    frame_bg: "#1b1b1b",
    frame_inner: "#B0B0B0",
    frame_border: "#121212",
    title_bg: "#e9e3d9",
    title_fg: "#111",
    art_bg: "#ddd",
    type_bg: "#ece7de",
    type_fg: "#222",
    rules_bg: "#f6f2ea",
    rules_fg: "#222",
    flavor_fg: "#555",
    footer_fg: "#444",
    pt_bg: "#e9e3d9",
    pt_fg: "#111",

    // Fonts
    font_serif: FONT_SERIF,
    font_sans: FONT_SANS,
    font_mono: FONT_MONO,

    // Layout
    card_sz: [CARD_WIDTH, CARD_HEIGHT],
    inner_rec: [
      OUTER_PADDING,
      OUTER_PADDING,
      CARD_WIDTH - 2 * OUTER_PADDING,
      CARD_HEIGHT - 2 * OUTER_PADDING,
    ],
    title_rec: [INNER_PADDING, INNER_PADDING, INNER_WIDTH, TITLE_H],
    title_txt_rec: [
      INNER_PADDING + 18,
      INNER_PADDING + TITLE_H - 16,
      FONT_SIZE_TITLE,
    ],
    title_rarity_rec: [
      CARD_WIDTH - 2 * INNER_PADDING - 18,
      INNER_PADDING + TITLE_H - 16,
      FONT_SIZE_RULE,
    ],
    art_rec: [INNER_PADDING, artY, INNER_WIDTH, ART_H],
    type_rec: [INNER_PADDING, typeY, INNER_WIDTH, typeH],
    type_txt_rec: [INNER_PADDING + 18, typeY + typeH - 18, FONT_SIZE_RULE],
    rules_rec: [INNER_PADDING, rulesY, INNER_WIDTH, rulesH],
    rules_txt_rec: [INNER_PADDING + 18, rulesY + 6 + 20, FONT_SIZE_RULE],
    flavor_txt_rec: [
      INNER_PADDING + 18,
      rulesY + rulesH - 48,
      FONT_SIZE_RULE,
    ],
    footer_txt_rec_l: [
      INNER_PADDING + 11,
      CARD_HEIGHT - INNER_PADDING - 6,
      FONT_SIZE_FOOTER,
    ],
    footer_txt_rec_r: [
      CARD_WIDTH - 2 * INNER_PADDING - 11,
      CARD_HEIGHT - INNER_PADDING - 6,
      FONT_SIZE_FOOTER,
    ],
    opt_box: [INNER_PADDING + INNER_WIDTH, optY, 150, 54],
    opt_txt_rec: [
      INNER_PADDING + INNER_WIDTH - 75,
      optY + OPT_H - 16,
      FONT_SIZE_RULE,
    ],
  };

  // Apply overrides from card's theme field
  for (const [key, value] of Object.entries(overrides)) {
    if (key in theme) {
      (theme as unknown as Record<string, unknown>)[key] = value;
    }
  }

  // Override type_txt_rec for spell/monster (match Python behavior)
  if (cardType === "spell" || cardType === "monster") {
    theme.type_txt_rec = [INNER_PADDING + 18, typeY + 6 + 20, 24];
  }

  // Override flavor_txt_rec for monster
  if (cardType === "monster") {
    theme.flavor_txt_rec = [
      INNER_PADDING + 18,
      rulesY + rulesH - 24,
      FONT_SIZE_RULE,
    ];
  }

  // Apply rarity color
  if (rarity in rarityColors) {
    theme.frame_inner = rarityColors[rarity];
  }

  return theme;
}
