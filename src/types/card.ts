export interface BaseCard {
  name: string;
  set_code?: string;
  collector?: string;
  author?: string;
  copyright?: string;
  theme?: Record<string, string | number>;
  rarity?: string;
}

export interface ItemCard extends BaseCard {
  card_type?: undefined;
  type_line: string;
  rules_text: string[] | string;
  flavor_text?: string;
  art_path?: string;
  pt?: string | null;
  price?: string | null;
  weight?: string | null;
}

export interface SpellInfo {
  level: string;
  school: string;
  casting_time: string;
  range_area: string;
  components: string[];
  duration: string;
  attack_save: string;
  damage_effect: string;
}

export interface SpellCard extends BaseCard {
  card_type: "spell";
  spell: SpellInfo;
  rules_text: string[] | string;
}

export interface AbilityScore {
  score: number;
  mod: number;
  save: number;
}

export interface MonsterSkill {
  name: string;
  bonus: number;
}

export interface MonsterAction {
  name: string;
  text: string;
  spell_list?: Array<{
    cooldown: string;
    spells: string[];
  }>;
}

export interface MonsterReaction {
  name: string;
  trigger: string;
  response: string;
}

export interface MonsterTrait {
  name: string;
  text: string;
  tags?: string[];
}

export interface MonsterCard extends BaseCard {
  card_type: "monster";
  type_line: string;
  cr: string;
  ini: string;
  ac: number;
  hp: string;
  speed: string;
  att: Record<"STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA", AbilityScore>;
  skills: MonsterSkill[];
  gear: string[];
  senses: string[];
  languages: string[];
  traits: MonsterTrait[];
  actions: MonsterAction[];
  bonus_actions: MonsterAction[];
  reactions: MonsterReaction[];
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
}

export type Card = ItemCard | SpellCard | MonsterCard;

export function isSpellCard(card: Card): card is SpellCard {
  return (card as SpellCard).card_type === "spell";
}

export function isMonsterCard(card: Card): card is MonsterCard {
  return (card as MonsterCard).card_type === "monster";
}

export function isItemCard(card: Card): card is ItemCard {
  return !isSpellCard(card) && !isMonsterCard(card);
}
