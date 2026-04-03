import type { Theme } from "../types/theme.js";
import type {
  MonsterSkill,
  MonsterAction,
  MonsterReaction,
  MonsterTrait,
} from "../types/card.js";
import { wrapSvgText } from "../utils/text-wrap.js";

interface Props {
  theme: Theme;
  skills: MonsterSkill[];
  gear: string[];
  senses: string[];
  languages: string[];
  actions: MonsterAction[];
  bonusActions: MonsterAction[];
  reactions: MonsterReaction[];
  traits: MonsterTrait[];
  resistances: string[];
  immunities: string[];
  vulnerabilities: string[];
  monTypeLine: string;
}

function renderSection(
  label: string,
  text: string,
  x: number,
  y: number,
  off: number,
  fs: number,
  theme: Theme,
  widthChars: number,
  indentedX: number,
): { elements: React.ReactElement[]; newOff: number } {
  const elements: React.ReactElement[] = [];

  // Header
  elements.push(
    <text
      key={`${label}-header-${off}`}
      x={x}
      y={y + off}
      fontFamily={theme.font_serif}
      fontSize={fs}
      fontWeight="bold"
      fill={theme.rules_fg}
    >
      {label}:
    </text>,
  );
  off += fs;

  // Content
  const entries = wrapSvgText(text, widthChars, fs, indentedX);
  elements.push(
    <text
      key={`${label}-content-${off}`}
      x={x}
      y={y + off}
      fontFamily={theme.font_serif}
      fontSize={fs}
      fill={theme.rules_fg}
    >
      {entries.map((entry, i) => (
        <tspan key={i} x={entry.x} dy={entry.dy}>
          {entry.text}
        </tspan>
      ))}
    </text>,
  );
  off += fs * entries.length;

  return { elements, newOff: off };
}

export function MonsterRulesBox({
  theme,
  skills,
  gear,
  senses,
  languages,
  actions,
  bonusActions,
  reactions,
  traits,
  resistances,
  immunities,
  vulnerabilities,
  monTypeLine,
}: Props) {
  const [rx, ry, rw, rh] = theme.rules_rec;
  const [tx, ty, tfs] = theme.rules_txt_rec;
  const [fx, fy, ffs] = theme.flavor_txt_rec;
  const widthChars = 60;
  const indentedX = tx + tfs;

  const allElements: React.ReactElement[] = [];
  let off = 0;

  // Skills
  if (skills.length > 0) {
    const text = skills
      .map((s) => `${s.name}${s.bonus >= 0 ? "+" : ""}${s.bonus}`)
      .join(", ");
    const result = renderSection(
      "Skills",
      text,
      tx,
      ty,
      off,
      tfs,
      theme,
      widthChars,
      indentedX,
    );
    allElements.push(...result.elements);
    off = result.newOff;
  }

  // Resistances
  if (resistances.length > 0) {
    const text = resistances.join(", ");
    const result = renderSection(
      "Resistances",
      text,
      tx,
      ty,
      off,
      tfs,
      theme,
      widthChars,
      indentedX,
    );
    allElements.push(...result.elements);
    off = result.newOff;
  }

  // Immunities
  if (immunities.length > 0) {
    const text = immunities.join(", ");
    const result = renderSection(
      "Immunities",
      text,
      tx,
      ty,
      off,
      tfs,
      theme,
      widthChars,
      indentedX,
    );
    allElements.push(...result.elements);
    off = result.newOff;
  }

  // Vulnerabilities
  if (vulnerabilities.length > 0) {
    const text = vulnerabilities.join(", ");
    const result = renderSection(
      "Vulnerabilities",
      text,
      tx,
      ty,
      off,
      tfs,
      theme,
      widthChars,
      indentedX,
    );
    allElements.push(...result.elements);
    off = result.newOff;
  }

  // Gear
  if (gear.length > 0) {
    const text = gear.join(", ");
    const result = renderSection(
      "Gear",
      text,
      tx,
      ty,
      off,
      tfs,
      theme,
      widthChars,
      indentedX,
    );
    allElements.push(...result.elements);
    off = result.newOff;
  }

  // Senses
  if (senses.length > 0) {
    const text = senses.join(", ");
    const result = renderSection(
      "Senses",
      text,
      tx,
      ty,
      off,
      tfs,
      theme,
      widthChars,
      indentedX,
    );
    allElements.push(...result.elements);
    off = result.newOff;
  }

  // Languages
  if (languages.length > 0) {
    const text = languages.join(", ");
    const result = renderSection(
      "Languages",
      text,
      tx,
      ty,
      off,
      tfs,
      theme,
      widthChars,
      indentedX,
    );
    allElements.push(...result.elements);
    off = result.newOff;
  }

  // Traits
  if (traits.length > 0) {
    const text = traits.map((t) => `${t.name}: ${t.text}`).join("\n");
    const result = renderSection(
      "Traits",
      text,
      tx,
      ty,
      off,
      tfs,
      theme,
      widthChars,
      indentedX,
    );
    allElements.push(...result.elements);
    off = result.newOff;
  }

  // Actions
  if (actions.length > 0) {
    let text = "";
    for (const action of actions) {
      if (action.name === "Spellcasting" && action.spell_list) {
        text += `${action.name}: ${action.text}\n`;
        for (const sl of action.spell_list) {
          text += `${sl.cooldown}: ${sl.spells.join(", ")}\n`;
        }
      } else {
        text += `${action.name}: ${action.text}\n`;
      }
    }
    text = text.replace(/\n+$/, "");

    // Header
    allElements.push(
      <text
        key={`actions-header-${off}`}
        x={tx}
        y={ty + off}
        fontFamily={theme.font_serif}
        fontSize={tfs}
        fontWeight="bold"
        fill={theme.rules_fg}
      >
        Actions:
      </text>,
    );
    off += tfs;

    // Content (indented, matching Python's x+fs for actions)
    const entries = wrapSvgText(text, widthChars, tfs, indentedX);
    allElements.push(
      <text
        key={`actions-content-${off}`}
        x={tx + tfs}
        y={ty + off}
        fontFamily={theme.font_serif}
        fontSize={tfs}
        fill={theme.rules_fg}
      >
        {entries.map((entry, i) => (
          <tspan key={i} x={entry.x} dy={entry.dy}>
            {entry.text}
          </tspan>
        ))}
      </text>,
    );
    off += tfs * entries.length;
  }

  // Bonus Actions
  if (bonusActions.length > 0) {
    const text = bonusActions
      .map((a) => `${a.name}: ${a.text}`)
      .join("\n");
    const result = renderSection(
      "Bonus Actions",
      text,
      tx,
      ty,
      off,
      tfs,
      theme,
      widthChars,
      indentedX,
    );
    allElements.push(...result.elements);
    off = result.newOff;
  }

  // Reactions
  if (reactions.length > 0) {
    const text = reactions
      .map(
        (r) => `${r.name}: Trigger: ${r.trigger} Response: ${r.response}`,
      )
      .join("\n");
    const result = renderSection(
      "Reactions",
      text,
      tx,
      ty,
      off,
      tfs,
      theme,
      widthChars,
      indentedX,
    );
    allElements.push(...result.elements);
    off = result.newOff;
  }

  // Flavor text (monster type line)
  const flavorText = monTypeLine
    ? `\u201C${monTypeLine}\u201D`
    : "";

  const flavorEntries = flavorText
    ? wrapSvgText(flavorText, widthChars, ffs, fx)
    : [];

  return (
    <>
      <rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        rx={10}
        ry={10}
        fill={theme.rules_bg}
        stroke={theme.frame_border}
        strokeWidth={2}
      />
      {allElements}
      {flavorEntries.length > 0 && (
        <text
          x={fx}
          y={fy}
          fontFamily={theme.font_serif}
          fontSize={ffs}
          fontStyle="italic"
          fill={theme.flavor_fg}
        >
          {flavorEntries.map((entry, i) => (
            <tspan key={i} x={entry.x} dy={entry.dy}>
              {entry.text}
            </tspan>
          ))}
        </text>
      )}
    </>
  );
}
