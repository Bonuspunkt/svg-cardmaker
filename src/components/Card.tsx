import type { Card as CardType } from "../types/card.js";
import { isSpellCard, isMonsterCard } from "../types/card.js";
import { getTheme } from "../theme/index.js";
import { CardFrame } from "./CardFrame.js";
import { TitleBar } from "./TitleBar.js";
import { ArtSection, ArtClipDef } from "./ArtSection.js";
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
}

export function Card({ card }: Props) {
  if (isSpellCard(card)) return <SpellCardSvg card={card} />;
  if (isMonsterCard(card)) return <MonsterCardSvg card={card} />;
  return <ItemCardSvg card={card} />;
}

function ItemCardSvg({
  card,
}: {
  card: import("../types/card.js").ItemCard;
}) {
  const theme = getTheme(
    card.theme ?? {},
    card.rarity ?? "Common",
    "item",
  );
  const [w, h] = theme.card_sz;

  return (
    <svg
      width={`${w}px`}
      height={`${h}px`}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <ArtClipDef theme={theme} />
      </defs>
      <CardFrame theme={theme} />
      <TitleBar
        theme={theme}
        name={card.name ?? "Unnamed Item"}
        rarity={card.rarity ?? "Common"}
      />
      <ArtSection theme={theme} artPath={card.art_path} />
      <TypeLine
        theme={theme}
        typeLine={card.type_line ?? "Item \u2014 Wondrous"}
      />
      <RulesBox
        theme={theme}
        rules={card.rules_text ?? "\u2014"}
        flavor={(card.flavor_text ?? "").trim()}
      />
      <OptionalBoxes
        theme={theme}
        pt={card.pt}
        price={card.price}
        weight={card.weight}
      />
      <Footer
        theme={theme}
        setCode={card.set_code ?? "DND"}
        collector={card.collector ?? "001/001"}
        author={card.author ?? ""}
        copyrightStr={card.copyright ?? "\u00A9 2025"}
      />
    </svg>
  );
}

function SpellCardSvg({
  card,
}: {
  card: import("../types/card.js").SpellCard;
}) {
  const theme = getTheme(
    card.theme ?? {},
    card.rarity ?? "Common",
    "spell",
  );
  const [w, h] = theme.card_sz;

  const spell = card.spell ?? {};
  const level = spell.level ?? "Cantrip";
  const school = "School: " + (spell.school ?? "");
  const castingTime = "Casting time: " + (spell.casting_time ?? "");
  const rangeArea = "Range/Area: " + (spell.range_area ?? "");
  const componentsList = spell.components ?? [];
  const components = "Components: " + componentsList.join(", ");
  const duration = "Duration: " + (spell.duration ?? "");
  const attackSave = "Attack/Save: " + (spell.attack_save ?? "");
  const damageEffect = "Damage/Effect: " + (spell.damage_effect ?? "");

  return (
    <svg
      width={`${w}px`}
      height={`${h}px`}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs />
      <CardFrame theme={theme} />
      <TitleBar
        theme={theme}
        name={card.name ?? "Unnamed Spell"}
        rarity={level}
      />
      <SpellTypeGrid
        theme={theme}
        school={school}
        castingTime={castingTime}
        rangeArea={rangeArea}
        components={components}
        duration={duration}
        attackSave={attackSave}
        damageEffect={damageEffect}
      />
      <RulesBox theme={theme} rules={card.rules_text ?? "\u2014"} flavor="" />
      <Footer
        theme={theme}
        setCode={card.set_code ?? "DND"}
        collector={card.collector ?? "001/001"}
        author={card.author ?? ""}
        copyrightStr={card.copyright ?? "\u00A9 2025"}
      />
    </svg>
  );
}

function MonsterCardSvg({
  card,
}: {
  card: import("../types/card.js").MonsterCard;
}) {
  const theme = getTheme(
    card.theme ?? {},
    card.rarity ?? "Common",
    "monster",
  );
  const [w, h] = theme.card_sz;

  const att = card.att ?? {};

  return (
    <svg
      width={`${w}px`}
      height={`${h}px`}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs />
      <CardFrame theme={theme} />
      <TitleBar
        theme={theme}
        name={card.name ?? "Unnamed Monster"}
        rarity={card.cr ?? ""}
      />
      <MonsterStatBlock
        theme={theme}
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
      <MonsterRulesBox
        theme={theme}
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
        theme={theme}
        setCode={card.set_code ?? "DND"}
        collector={card.collector ?? "001/001"}
        author={card.author ?? ""}
        copyrightStr={card.copyright ?? "\u00A9 2025"}
      />
    </svg>
  );
}
