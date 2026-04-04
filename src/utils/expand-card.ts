import type { Card, ItemCard, SpellCard, MonsterCard } from "../types/card.js";
import { isMonsterCard, isSpellCard, isItemCard } from "../types/card.js";

/**
 * Approximate characters per line in the monster rules box.
 */
const CHARS_PER_LINE = 45;

/** Max lines in a monster rules box (with stat block). */
const MAX_LINES_STATS = 24;
/** Max lines in a continuation rules box (no stat block). */
const MAX_LINES_CONT = 36;

/** Max lines in an item rules box (with art/title/type). */
const MAX_LINES_ITEM = 12;
/** Max lines in an item continuation rules box (no art/title/type). */
const MAX_LINES_ITEM_CONT = 36;

/** Max lines in a spell rules box (with spell grid). */
const MAX_LINES_SPELL = 26;
/** Max lines in a spell continuation rules box (no spell grid). */
const MAX_LINES_SPELL_CONT = 31;

interface SectionDef {
  key: string;
  label: string;
  lines: number;
}

function estimateLines(text: string): number {
  if (!text) return 0;
  let total = 0;
  for (const line of text.split("\n")) {
    total += Math.max(1, Math.ceil(line.length / CHARS_PER_LINE));
  }
  return total;
}

function sectionLines(_label: string, text: string): number {
  return 1 + estimateLines(text);
}

/** Sections that go on the stats page (page 2). */
function buildStatsSections(card: MonsterCard): SectionDef[] {
  const sections: SectionDef[] = [];
  const push = (key: string, label: string, text: string) => {
    if (text) sections.push({ key, label, lines: sectionLines(label, text) });
  };

  if (card.skills?.length) {
    push("skills", "Skills", card.skills.map((s) => `${s.name}${s.bonus >= 0 ? "+" : ""}${s.bonus}`).join(", "));
  }
  if (card.resistances?.length) push("resistances", "Resistances", card.resistances.join(", "));
  if (card.immunities?.length) push("immunities", "Immunities", card.immunities.join(", "));
  if (card.vulnerabilities?.length) push("vulnerabilities", "Vulnerabilities", card.vulnerabilities.join(", "));
  if (card.gear?.length) push("gear", "Gear", card.gear.join(", "));
  if (card.senses?.length) push("senses", "Senses", card.senses.join(", "));
  if (card.languages?.length) push("languages", "Languages", card.languages.join(", "));
  if (card.traits?.length) {
    push("traits", "Traits", card.traits.map((t) => `${t.name}: ${t.text}`).join("\n"));
  }

  return sections;
}

/** Sections that go on the action pages (page 3+). */
function buildActionSections(card: MonsterCard): SectionDef[] {
  const sections: SectionDef[] = [];
  const push = (key: string, label: string, text: string) => {
    if (text) sections.push({ key, label, lines: sectionLines(label, text) });
  };

  if (card.actions?.length) {
    let text = "";
    for (const action of card.actions) {
      if (action.name === "Spellcasting" && action.spell_list) {
        text += `${action.name}: ${action.text}\n`;
        for (const sl of action.spell_list) {
          text += `${sl.cooldown}: ${sl.spells.join(", ")}\n`;
        }
      } else {
        text += `${action.name}: ${action.text}\n`;
      }
    }
    push("actions", "Actions", text.replace(/\n+$/, ""));
  }

  if (card.bonus_actions?.length) {
    push("bonusActions", "Bonus Actions", card.bonus_actions.map((a) => `${a.name}: ${a.text}`).join("\n"));
  }

  if (card.reactions?.length) {
    push("reactions", "Reactions", card.reactions.map((r) => {
      if (r.trigger && r.response) {
        return `${r.name}: Trigger: ${r.trigger} Response: ${r.response}`;
      }
      return `${r.name}: ${r.text ?? ""}`;
    }).join("\n"));
  }

  return sections;
}

function partitionSections(sections: SectionDef[], maxLines: number): SectionDef[][] {
  const pages: SectionDef[][] = [];
  let current: SectionDef[] = [];
  let usedLines = 0;

  for (const section of sections) {
    if (current.length > 0 && usedLines + section.lines > maxLines) {
      pages.push(current);
      current = [];
      usedLines = 0;
    }
    current.push(section);
    usedLines += section.lines;
  }
  if (current.length > 0) pages.push(current);
  return pages;
}

function sectionKeys(sections: SectionDef[]): Set<string> {
  return new Set(sections.map((s) => s.key));
}

function makeMonsterPage(card: MonsterCard, sections: SectionDef[], isContinuation: boolean): MonsterCard {
  const keys = sectionKeys(sections);
  return {
    ...card,
    continuation: isContinuation,
    name: card.name,
    type_line: isContinuation ? "" : card.type_line,
    skills: keys.has("skills") ? card.skills : [],
    resistances: keys.has("resistances") ? card.resistances : [],
    immunities: keys.has("immunities") ? card.immunities : [],
    vulnerabilities: keys.has("vulnerabilities") ? card.vulnerabilities : [],
    gear: keys.has("gear") ? card.gear : [],
    senses: keys.has("senses") ? card.senses : [],
    languages: keys.has("languages") ? card.languages : [],
    traits: keys.has("traits") ? card.traits : [],
    actions: keys.has("actions") ? card.actions : [],
    bonus_actions: keys.has("bonusActions") ? card.bonus_actions : [],
    reactions: keys.has("reactions") ? card.reactions : [],
  };
}

function splitTextByLines(text: string, maxLines: number): [string, string] {
  const lines: string[] = [];
  for (const line of text.split("\n")) {
    const wrapped = Math.max(1, Math.ceil(line.length / CHARS_PER_LINE));
    lines.push(...Array(wrapped).fill(null).map((_, i) => {
      const start = i * CHARS_PER_LINE;
      return line.slice(start, start + CHARS_PER_LINE);
    }));
  }
  if (lines.length <= maxLines) return [text, ""];

  // Walk the original text and split at a paragraph boundary that fits
  const paragraphs = text.split("\n");
  let usedLines = 0;
  let splitIdx = 0;
  for (let i = 0; i < paragraphs.length; i++) {
    const pLines = Math.max(1, Math.ceil(paragraphs[i].length / CHARS_PER_LINE));
    if (usedLines + pLines > maxLines) break;
    usedLines += pLines;
    splitIdx = i + 1;
  }
  if (splitIdx === 0) splitIdx = 1; // always put at least one paragraph on the first card
  return [
    paragraphs.slice(0, splitIdx).join("\n"),
    paragraphs.slice(splitIdx).join("\n"),
  ];
}

function expandItemCard(card: ItemCard): Card[] {
  const rulesText = Array.isArray(card.rules_text)
    ? card.rules_text.join("\n")
    : (card.rules_text ?? "");

  const totalLines = estimateLines(rulesText);
  if (totalLines <= MAX_LINES_ITEM) return [card];

  const result: Card[] = [];
  let remaining = rulesText;
  let isFirst = true;

  while (remaining) {
    const maxLines = isFirst ? MAX_LINES_ITEM : MAX_LINES_ITEM_CONT;
    const [chunk, rest] = splitTextByLines(remaining, maxLines);
    result.push({
      ...card,
      continuation: !isFirst,
      rules_text: chunk,
      flavor_text: isFirst ? card.flavor_text : "",
      pt: isFirst ? card.pt : null,
      price: isFirst ? card.price : null,
      weight: isFirst ? card.weight : null,
    });
    remaining = rest;
    isFirst = false;
  }

  return result;
}

function expandSpellCard(card: SpellCard): Card[] {
  const rulesText = Array.isArray(card.rules_text)
    ? card.rules_text.join("\n")
    : (card.rules_text ?? "");

  const totalLines = estimateLines(rulesText);
  if (totalLines <= MAX_LINES_SPELL) return [card];

  const result: Card[] = [];
  let remaining = rulesText;
  let isFirst = true;

  while (remaining) {
    const maxLines = isFirst ? MAX_LINES_SPELL : MAX_LINES_SPELL_CONT;
    const [chunk, rest] = splitTextByLines(remaining, maxLines);
    result.push({
      ...card,
      continuation: !isFirst,
      name: isFirst ? card.name : card.name,
      rules_text: chunk,
    });
    remaining = rest;
    isFirst = false;
  }

  return result;
}

function expandMonsterCard(card: MonsterCard): Card[] {
  const result: Card[] = [];

  // Page 1: Portrait card — full-bleed art with monster name at bottom
  const portrait: ItemCard = {
    name: card.name,
    rarity: card.rarity,
    type_line: "",
    rules_text: [],
    flavor_text: card.name,
    portrait: true,
    art_path: card.art_path ?? "art/dickbutt.svg",
    art_src: card.art_src,
    set_code: card.set_code,
    collector: card.collector,
    author: card.author,
    copyright: card.copyright,
    theme: card.theme,
  };
  result.push(portrait);

  // Page 2+: Stats pages (stat block + skills/traits/etc)
  // No type_line flavor — that moves to the action page title
  const statsCard = { ...card, type_line: "" };
  const statsSections = buildStatsSections(card);
  const statsPages = partitionSections(statsSections, MAX_LINES_STATS);
  for (const [i, page] of statsPages.entries()) {
    result.push(makeMonsterPage(statsCard, page, i > 0));
  }

  // Page 3+: Action pages — title shows the type line (e.g. "Tiny Aberration, Chaotic Neutral")
  const actionSections = buildActionSections(card);
  if (actionSections.length > 0) {
    const actionPages = partitionSections(actionSections, MAX_LINES_CONT);
    for (const [i, page] of actionPages.entries()) {
      const actionCard = {
        ...card,
        name: i === 0 ? card.type_line : card.name,
        cr: "",
        type_line: "",
      };
      result.push(makeMonsterPage(actionCard, page, true));
    }
  }

  return result;
}

/** Total estimated content lines for a monster (stats sections + action sections). */
export function estimateMonsterContentLines(card: MonsterCard): number {
  const stats = buildStatsSections(card);
  const actions = buildActionSections(card);
  return [...stats, ...actions].reduce((sum, s) => sum + s.lines, 0);
}

/** Estimated content lines for an item's rules text. */
export function estimateItemContentLines(card: ItemCard): number {
  const rulesText = Array.isArray(card.rules_text)
    ? card.rules_text.join("\n")
    : (card.rules_text ?? "");
  return estimateLines(rulesText);
}

/** Max lines that fit in a single-card-height tent bottom (with stat block).
 *  Reduced by 1 vs normal because fold margin shifts content start down. */
export const TENT_SINGLE_CARD_LINES = MAX_LINES_STATS - 1;
/** Max lines that fit in a normal item card rules box. */
export { MAX_LINES_ITEM as TENT_ITEM_SINGLE_CARD_LINES };
/** Max lines that fit in a 1:1 item tent card (normal + one extra card height of rules).
 *  Reduced by 3 to account for ~0.6cm fold overlay hiding content. */
export const TENT_ITEM_DOUBLE_CARD_LINES = MAX_LINES_ITEM + MAX_LINES_ITEM_CONT - 3;

export function expandCard(card: Card, tentMode?: boolean): Card[] {
  if (isMonsterCard(card)) return tentMode ? [card] : expandMonsterCard(card);
  if (isSpellCard(card)) return expandSpellCard(card);
  if (isItemCard(card)) return tentMode ? [card] : expandItemCard(card);
  return [card];
}
