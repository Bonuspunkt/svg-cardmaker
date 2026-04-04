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
  SECTION_GAP,
} from "./layout.js";

export function getTheme(
  overrides: Record<string, string | number>,
  rarity: string,
  cardType: "item" | "item-continuation" | "spell" | "spell-continuation" | "monster" | "monster-continuation",
): Theme {
  let artY = INNER_PADDING + TITLE_H + SECTION_GAP;
  let typeY: number;
  let typeH: number;
  let rulesY: number;
  let rulesH: number;

  if (cardType === "item-continuation") {
    // No title/art/type — rules box takes all available space
    typeY = INNER_PADDING;
    typeH = 0;
    rulesY = INNER_PADDING;
    rulesH = RULES_H_ITEM + ART_H + TYPE_H_ITEM + TITLE_H + 3 * SECTION_GAP;
  } else if (cardType === "monster-continuation") {
    // No stat block — rules box takes all the space after the title
    typeY = INNER_PADDING + TITLE_H + SECTION_GAP;
    typeH = 0;
    rulesY = typeY;
    rulesH = RULES_H_MONSTER + TYPE_H_MONSTER + SECTION_GAP;
  } else if (cardType === "spell-continuation") {
    // No title bar or spell grid — rules box takes all available space
    typeY = INNER_PADDING;
    typeH = 0;
    rulesY = INNER_PADDING;
    rulesH = RULES_H_SPELL + TYPE_H_SPELL + TITLE_H + 2 * SECTION_GAP;
  } else if (cardType === "spell") {
    typeY = INNER_PADDING + TITLE_H + SECTION_GAP;
    typeH = TYPE_H_SPELL;
    rulesY = typeY + typeH + SECTION_GAP;
    rulesH = RULES_H_SPELL;
  } else if (cardType === "monster") {
    typeY = INNER_PADDING + TITLE_H + SECTION_GAP;
    typeH = TYPE_H_MONSTER;
    rulesY = typeY + typeH + SECTION_GAP;
    rulesH = RULES_H_MONSTER;
  } else {
    typeY = artY + ART_H + SECTION_GAP;
    typeH = TYPE_H_ITEM;
    rulesY = typeY + typeH + SECTION_GAP;
    rulesH = RULES_H_ITEM;
  }

  const optY = rulesY + rulesH + SECTION_GAP;

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

    // Layout (all values in cm)
    card_sz: [CARD_WIDTH, CARD_HEIGHT],
    inner_rec: [
      OUTER_PADDING,
      OUTER_PADDING,
      CARD_WIDTH - 2 * OUTER_PADDING,
      CARD_HEIGHT - 2 * OUTER_PADDING,
    ],
    title_rec: [INNER_PADDING, INNER_PADDING, INNER_WIDTH, TITLE_H],
    title_txt_rec: [
      INNER_PADDING + FONT_SIZE_RULE * 0.75,
      INNER_PADDING + TITLE_H - FONT_SIZE_RULE * 0.667,
      FONT_SIZE_TITLE,
    ],
    title_rarity_rec: [
      CARD_WIDTH - 2 * INNER_PADDING - FONT_SIZE_RULE * 0.75,
      INNER_PADDING + TITLE_H - FONT_SIZE_RULE * 0.667,
      FONT_SIZE_RULE,
    ],
    art_rec: [INNER_PADDING, artY, INNER_WIDTH, ART_H],
    type_rec: [INNER_PADDING, typeY, INNER_WIDTH, typeH],
    type_txt_rec: [INNER_PADDING + FONT_SIZE_RULE * 0.75, typeY + typeH - FONT_SIZE_RULE * 0.75, FONT_SIZE_RULE],
    rules_rec: [INNER_PADDING, rulesY, INNER_WIDTH, rulesH],
    rules_txt_rec: [INNER_PADDING + FONT_SIZE_RULE * 0.75, rulesY + SECTION_GAP + FONT_SIZE_RULE * 0.833, FONT_SIZE_RULE],
    flavor_txt_rec: [
      INNER_PADDING + FONT_SIZE_RULE * 0.75,
      rulesY + rulesH - FONT_SIZE_RULE * 2,
      FONT_SIZE_RULE,
    ],
    footer_txt_rec_l: [
      INNER_PADDING + FONT_SIZE_FOOTER,
      CARD_HEIGHT - INNER_PADDING - SECTION_GAP,
      FONT_SIZE_FOOTER,
    ],
    footer_txt_rec_r: [
      CARD_WIDTH - 2 * INNER_PADDING - FONT_SIZE_FOOTER,
      CARD_HEIGHT - INNER_PADDING - SECTION_GAP,
      FONT_SIZE_FOOTER,
    ],
    opt_box: [INNER_PADDING + INNER_WIDTH, optY, INNER_WIDTH * 0.212, OPT_H],
    opt_txt_rec: [
      INNER_PADDING + INNER_WIDTH - INNER_WIDTH * 0.106,
      optY + OPT_H - FONT_SIZE_RULE * 0.667,
      FONT_SIZE_RULE,
    ],
  };

  // Apply overrides
  for (const [key, value] of Object.entries(overrides)) {
    if (key in theme) {
      (theme as unknown as Record<string, unknown>)[key] = value;
    }
  }

  // Override type_txt_rec for spell/monster
  if (cardType === "spell" || cardType === "monster") {
    theme.type_txt_rec = [INNER_PADDING + FONT_SIZE_RULE * 0.75, typeY + SECTION_GAP + FONT_SIZE_RULE * 0.833, FONT_SIZE_RULE];
  }

  // Override flavor_txt_rec for monster
  if (cardType === "monster") {
    theme.flavor_txt_rec = [
      INNER_PADDING + FONT_SIZE_RULE * 0.75,
      rulesY + rulesH - FONT_SIZE_RULE,
      FONT_SIZE_RULE,
    ];
  }

  // Apply rarity color
  if (rarity in rarityColors) {
    theme.frame_inner = rarityColors[rarity];
  }

  return theme;
}

/** Convert a Theme to a CSS custom-properties object for the card root element. */
export function themeToCssVars(theme: Theme): Record<string, string> {
  const c = (v: number) => `${v}cm`;
  return {
    // Colors
    "--frame-bg": theme.frame_bg,
    "--frame-inner": theme.frame_inner,
    "--frame-border": theme.frame_border,
    "--title-bg": theme.title_bg,
    "--title-fg": theme.title_fg,
    "--art-bg": theme.art_bg,
    "--type-bg": theme.type_bg,
    "--type-fg": theme.type_fg,
    "--rules-bg": theme.rules_bg,
    "--rules-fg": theme.rules_fg,
    "--flavor-fg": theme.flavor_fg,
    "--footer-fg": theme.footer_fg,
    "--pt-bg": theme.pt_bg,
    "--pt-fg": theme.pt_fg,

    // Fonts
    "--font-serif": theme.font_serif,
    "--font-sans": theme.font_sans,

    // Card size
    "--card-w": c(theme.card_sz[0]),
    "--card-h": c(theme.card_sz[1]),

    // Inner panel
    "--inner-x": c(theme.inner_rec[0]),
    "--inner-y": c(theme.inner_rec[1]),
    "--inner-w": c(theme.inner_rec[2]),
    "--inner-h": c(theme.inner_rec[3]),

    // Title bar
    "--title-x": c(theme.title_rec[0]),
    "--title-y": c(theme.title_rec[1]),
    "--title-w": c(theme.title_rec[2]),
    "--title-h": c(theme.title_rec[3]),
    "--title-fs": c(theme.title_txt_rec[2]),
    "--title-rarity-fs": c(theme.title_rarity_rec[2]),

    // Art section
    "--art-x": c(theme.art_rec[0]),
    "--art-y": c(theme.art_rec[1]),
    "--art-w": c(theme.art_rec[2]),
    "--art-h": c(theme.art_rec[3]),

    // Type line
    "--type-x": c(theme.type_rec[0]),
    "--type-y": c(theme.type_rec[1]),
    "--type-w": c(theme.type_rec[2]),
    "--type-h": c(theme.type_rec[3]),
    "--type-fs": c(theme.type_txt_rec[2]),

    // Rules box
    "--rules-x": c(theme.rules_rec[0]),
    "--rules-y": c(theme.rules_rec[1]),
    "--rules-w": c(theme.rules_rec[2]),
    "--rules-h": c(theme.rules_rec[3]),
    "--rules-fs": c(theme.rules_txt_rec[2]),
    "--flavor-fs": c(theme.flavor_txt_rec[2]),

    // Footer
    "--footer-x": c(theme.footer_txt_rec_l[0]),
    "--footer-y": c(theme.footer_txt_rec_l[1]),
    "--footer-fs": c(theme.footer_txt_rec_l[2]),

    // Optional boxes
    "--opt-box-x": c(theme.opt_box[0]),
    "--opt-box-y": c(theme.opt_box[1]),
    "--opt-box-w": c(theme.opt_box[2]),
    "--opt-box-h": c(theme.opt_box[3]),
    "--opt-fs": c(theme.opt_txt_rec[2]),
  };
}
