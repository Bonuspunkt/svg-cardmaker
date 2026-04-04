import type { Card as CardType } from "../types/card.js";
import { isSpellCard, isMonsterCard } from "../types/card.js";
import { getTheme, themeToCssVars } from "../theme/index.js";
import {
  CARD_HEIGHT,
  INNER_PADDING,
  INNER_WIDTH,
  TITLE_H,
  RULES_H_ITEM,
  TYPE_H_MONSTER,
  SECTION_GAP,
  OUTER_PADDING,
} from "../theme/layout.js";
import {
  estimateMonsterContentLines,
  estimateItemContentLines,
  TENT_SINGLE_CARD_LINES,
  TENT_ITEM_SINGLE_CARD_LINES,
  TENT_ITEM_DOUBLE_CARD_LINES,
} from "../utils/expand-card.js";
import { CardFrame } from "./CardFrame.js";
import { TitleBar } from "./TitleBar.js";
import { ArtSection } from "./ArtSection.js";
import { TypeLine } from "./TypeLine.js";
import { SpellTypeGrid } from "./SpellTypeGrid.js";
import { MonsterStatBlock } from "./MonsterStatBlock.js";
import { RulesBox } from "./RulesBox.js";
import { MonsterRulesBox } from "./MonsterRulesBox.js";
import { OptionalBoxes } from "./OptionalBoxes.js";
import { Footer } from "./Footer.js";

const DEFAULT_ATT = { score: 10, mod: 0, save: 0 };

interface Props {
  card: CardType;
  tentMode?: boolean;
}

export function Card({ card, tentMode }: Props) {
  if (isSpellCard(card)) return <SpellCard card={card} />;
  if (isMonsterCard(card)) {
    return tentMode ? <MonsterTentCard card={card} /> : <MonsterCard card={card} />;
  }
  if (tentMode && !card.portrait && !card.continuation) {
    const lines = estimateItemContentLines(card as import("../types/card.js").ItemCard);
    if (lines > TENT_ITEM_SINGLE_CARD_LINES) {
      return <ItemTentCard card={card as import("../types/card.js").ItemCard} />;
    }
  }
  return <ItemCard card={card} />;
}

function ItemCard({ card }: { card: import("../types/card.js").ItemCard }) {
  if (card.portrait) return <PortraitCard card={card} />;

  const isCont = card.continuation === true;
  const theme = getTheme(card.theme ?? {}, card.rarity ?? "Common", isCont ? "item-continuation" : "item");
  const vars = themeToCssVars(theme);

  return (
    <div className="card" style={vars as React.CSSProperties}>
      <CardFrame />
      {!isCont && (
        <>
          <TitleBar
            name={card.name ?? "Unnamed Item"}
            rarity={card.rarity ?? "Common"}
          />
          <ArtSection artPath={card.art_path} artSrc={card.art_src} />
          <TypeLine typeLine={card.type_line ?? "Item \u2014 Wondrous"} />
        </>
      )}
      <RulesBox
        rules={card.rules_text ?? "\u2014"}
        flavor={(card.flavor_text ?? "").trim()}
      />
      {!isCont && <OptionalBoxes pt={card.pt} price={card.price} weight={card.weight} />}
      <Footer
        setCode={card.set_code ?? "DND"}
        collector={card.collector ?? "001/001"}
        author={card.author ?? ""}
        copyrightStr={card.copyright ?? "\u00A9 2025"}
      />
    </div>
  );
}

function PortraitCard({ card }: { card: import("../types/card.js").ItemCard }) {
  const theme = getTheme(card.theme ?? {}, card.rarity ?? "Common", "item");
  const vars = themeToCssVars(theme);
  const src = card.art_src ?? card.art_path ?? null;

  return (
    <div className="card" style={vars as React.CSSProperties}>
      <CardFrame />
      <div className="portrait-art">
        {src && <img className="portrait-img" src={src} />}
      </div>
      <div className="portrait-title">
        <span className="portrait-title-text">{card.flavor_text || card.name}</span>
      </div>
    </div>
  );
}

function SpellCard({ card }: { card: import("../types/card.js").SpellCard }) {
  const isCont = card.continuation === true;
  const theme = getTheme(card.theme ?? {}, card.rarity ?? "Common", isCont ? "spell-continuation" : "spell");
  const vars = themeToCssVars(theme);

  const spell = card.spell ?? ({} as import("../types/card.js").SpellInfo);
  const level = spell.level ?? "Cantrip";

  return (
    <div className="card" style={vars as React.CSSProperties}>
      <CardFrame />
      {!isCont && <TitleBar name={card.name ?? "Unnamed Spell"} rarity={level} />}
      {!isCont && <SpellTypeGrid spell={spell} />}
      <RulesBox rules={card.rules_text ?? "\u2014"} flavor="" />
      <Footer
        setCode={card.set_code ?? "DND"}
        collector={card.collector ?? "001/001"}
        author={card.author ?? ""}
        copyrightStr={card.copyright ?? "\u00A9 2025"}
      />
    </div>
  );
}

function MonsterCard({
  card,
}: {
  card: import("../types/card.js").MonsterCard;
}) {
  const isCont = card.continuation === true;
  const theme = getTheme(card.theme ?? {}, card.rarity ?? "Common", isCont ? "monster-continuation" : "monster");
  const vars = themeToCssVars(theme);

  const att = card.att ?? {};

  return (
    <div className="card" style={vars as React.CSSProperties}>
      <CardFrame />
      <TitleBar
        name={card.name ?? "Unnamed Monster"}
        rarity={card.cr ?? ""}
      />
      {!isCont && (
        <MonsterStatBlock
          ac={card.ac ?? 10}
          hp={card.hp ?? "1D8"}
          ini={card.ini ?? "1D20+0"}
          speed={card.speed ?? "30 ft."}
          str={att.STR ?? DEFAULT_ATT}
          dex={att.DEX ?? DEFAULT_ATT}
          con={att.CON ?? DEFAULT_ATT}
          int={att.INT ?? DEFAULT_ATT}
          wis={att.WIS ?? DEFAULT_ATT}
          cha={att.CHA ?? DEFAULT_ATT}
        />
      )}
      <MonsterRulesBox
        skills={card.skills ?? []}
        gear={card.gear ?? []}
        senses={card.senses ?? []}
        languages={card.languages ?? []}
        actions={card.actions ?? []}
        bonusActions={card.bonus_actions ?? []}
        reactions={card.reactions ?? []}
        traits={card.traits ?? []}
        resistances={card.resistances ?? []}
        immunities={card.immunities ?? []}
        vulnerabilities={card.vulnerabilities ?? []}
        monTypeLine={card.type_line ?? ""}
      />
      <Footer
        setCode={card.set_code ?? "DND"}
        collector={card.collector ?? "001/001"}
        author={card.author ?? ""}
        copyrightStr={card.copyright ?? "\u00A9 2025"}
      />
    </div>
  );
}

/** Top section (player-facing, rotated 180°): always 1 card height */
const TENT_TOP_H = CARD_HEIGHT;

/** Positioning within the bottom section (relative to section top) */
const TENT_TITLE_Y = INNER_PADDING;
const TENT_STATS_Y = INNER_PADDING + TITLE_H + SECTION_GAP;
const TENT_RULES_Y = TENT_STATS_Y + TYPE_H_MONSTER + SECTION_GAP;

function MonsterTentCard({
  card,
}: {
  card: import("../types/card.js").MonsterCard;
}) {
  const theme = getTheme(card.theme ?? {}, card.rarity ?? "Common", "monster");
  const vars = themeToCssVars(theme);
  const att = card.att ?? {};
  const artSrc = card.art_src ?? card.art_path ?? "art/dickbutt.svg";

  // 1:1 if content fits in a single card height, otherwise 1:2
  const contentLines = estimateMonsterContentLines(card);
  const bottomCards = contentLines <= TENT_SINGLE_CARD_LINES ? 1 : 2;
  const bottomH = CARD_HEIGHT * bottomCards;
  const totalH = TENT_TOP_H + bottomH;
  const rulesH = bottomH - TENT_RULES_Y - OUTER_PADDING;

  const tentVars: Record<string, string> = {
    ...vars,
    "--card-h": `${totalH}cm`,
    "--inner-h": `${totalH - 2 * OUTER_PADDING}cm`,
  };

  const bottomStyle: React.CSSProperties = {
    position: "absolute",
    top: `${TENT_TOP_H}cm`,
    left: 0,
    width: "100%",
    height: `${bottomH}cm`,
    overflow: "hidden",
  };

  return (
    <div className="card tent-card" style={tentVars as React.CSSProperties}>
      <CardFrame />
      {/* Top section: portrait + name, rotated 180° */}
      <div className="tent-top">
        <div className="tent-art">
          {artSrc && <img className="portrait-img" src={artSrc} />}
        </div>
        <div className="tent-art-name">
          <span className="portrait-title-text">
            {card.name ?? "Unnamed Monster"}
          </span>
        </div>
      </div>
      {/* Fold guide line */}
      <div className="tent-divider" />
      {/* Bottom section: stats + rules */}
      <div style={bottomStyle}>
        <div
          className="title-bar"
          style={{
            position: "absolute",
            left: `${INNER_PADDING}cm`,
            top: `${TENT_TITLE_Y}cm`,
            width: `${INNER_WIDTH}cm`,
            height: `${TITLE_H}cm`,
          }}
        >
          <span className="title-name">{card.name ?? "Unnamed Monster"}</span>
          <span className="title-rarity">{card.cr ?? ""}</span>
        </div>
        <div
          className="tent-stats"
          style={{
            position: "absolute",
            left: `${INNER_PADDING}cm`,
            top: `${TENT_STATS_Y}cm`,
            width: `${INNER_WIDTH}cm`,
            height: `${TYPE_H_MONSTER}cm`,
          }}
        >
          <MonsterStatBlock
            ac={card.ac ?? 10}
            hp={card.hp ?? "1D8"}
            ini={card.ini ?? "1D20+0"}
            speed={card.speed ?? "30 ft."}
            str={att.STR ?? DEFAULT_ATT}
            dex={att.DEX ?? DEFAULT_ATT}
            con={att.CON ?? DEFAULT_ATT}
            int={att.INT ?? DEFAULT_ATT}
            wis={att.WIS ?? DEFAULT_ATT}
            cha={att.CHA ?? DEFAULT_ATT}
          />
        </div>
        <div
          className="tent-rules"
          style={{
            position: "absolute",
            left: `${INNER_PADDING}cm`,
            top: `${TENT_RULES_Y}cm`,
            width: `${INNER_WIDTH}cm`,
            height: `${rulesH}cm`,
          }}
        >
          <MonsterRulesBox
            skills={card.skills ?? []}
            gear={card.gear ?? []}
            senses={card.senses ?? []}
            languages={card.languages ?? []}
            actions={card.actions ?? []}
            bonusActions={card.bonus_actions ?? []}
            reactions={card.reactions ?? []}
            traits={card.traits ?? []}
            resistances={card.resistances ?? []}
            immunities={card.immunities ?? []}
            vulnerabilities={card.vulnerabilities ?? []}
            monTypeLine={card.type_line ?? ""}
          />
        </div>
        <Footer
          setCode={card.set_code ?? "DND"}
          collector={card.collector ?? "001/001"}
          author={card.author ?? ""}
          copyrightStr={card.copyright ?? "\u00A9 2025"}
        />
      </div>
    </div>
  );
}

/**
 * Item tent card — tall card (no rotation).
 * Top: title + art + type line (1 card height).
 * Bottom: extended rules + optional boxes + footer (1 or 2 card heights).
 */
function ItemTentCard({
  card,
}: {
  card: import("../types/card.js").ItemCard;
}) {
  const theme = getTheme(card.theme ?? {}, card.rarity ?? "Common", "item");
  const vars = themeToCssVars(theme);

  // Always at least 2 cards (dispatch only sends overflow items here).
  // 1:1 (2 cards) or 1:2 (3 cards) based on content.
  const contentLines = estimateItemContentLines(card);
  const cardCount = contentLines <= TENT_ITEM_DOUBLE_CARD_LINES ? 2 : 3;
  const totalH = CARD_HEIGHT * cardCount;
  // Extra card heights go to the rules box
  const extraH = CARD_HEIGHT * (cardCount - 1);
  const rulesH = RULES_H_ITEM + extraH;

  const tentVars: Record<string, string> = {
    ...vars,
    "--card-h": `${totalH}cm`,
    "--inner-h": `${totalH - 2 * OUTER_PADDING}cm`,
    "--rules-h": `${rulesH}cm`,
  };

  return (
    <div className="card" style={tentVars as React.CSSProperties}>
      <CardFrame />
      <TitleBar
        name={card.name ?? "Unnamed Item"}
        rarity={card.rarity ?? "Common"}
      />
      <ArtSection artPath={card.art_path} artSrc={card.art_src} />
      <TypeLine typeLine={card.type_line ?? "Item \u2014 Wondrous"} />
      {cardCount > 1 && (
        <div className="tent-divider" style={{ top: `${CARD_HEIGHT}cm` }} />
      )}
      {cardCount > 2 && (
        <div className="tent-divider" style={{ top: `${CARD_HEIGHT * 2}cm` }} />
      )}
      <RulesBox
        rules={card.rules_text ?? "\u2014"}
        flavor={(card.flavor_text ?? "").trim()}
      />
      <OptionalBoxes pt={card.pt} price={card.price} weight={card.weight} />
      <Footer
        setCode={card.set_code ?? "DND"}
        collector={card.collector ?? "001/001"}
        author={card.author ?? ""}
        copyrightStr={card.copyright ?? "\u00A9 2025"}
      />
    </div>
  );
}
