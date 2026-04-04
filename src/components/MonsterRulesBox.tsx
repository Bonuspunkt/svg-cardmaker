import type { CSSProperties } from "react";
import type { Theme } from "../types/theme.js";

const XHTML_NS = { xmlns: "http://www.w3.org/1999/xhtml" } as Record<
  string,
  string
>;
import type {
  MonsterSkill,
  MonsterAction,
  MonsterReaction,
  MonsterTrait,
} from "../types/card.js";

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

function Section({
  label,
  text,
  fontSize,
  fontFamily,
  color,
  indented,
}: {
  label: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  indented?: boolean;
}) {
  const headerStyle: CSSProperties = {
    fontWeight: "bold",
    fontSize: `${fontSize}px`,
    fontFamily,
    color,
    lineHeight: `${Math.round(fontSize * 1.25)}px`,
    margin: 0,
  };

  const contentStyle: CSSProperties = {
    fontSize: `${fontSize}px`,
    fontFamily,
    color,
    lineHeight: `${Math.round(fontSize * 1.25)}px`,
    margin: 0,
    paddingLeft: indented ? `${fontSize}px` : `${fontSize}px`,
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    wordWrap: "break-word",
  };

  return (
    <div>
      <div style={headerStyle}>{label}:</div>
      <div style={contentStyle}>{text}</div>
    </div>
  );
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
  const [, , tfs] = theme.rules_txt_rec;

  const flavorText = monTypeLine ? `\u201C${monTypeLine}\u201D` : "";

  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    padding: "6px 18px",
    boxSizing: "border-box",
    overflow: "hidden",
  };

  const flavorStyle: CSSProperties = {
    fontSize: `${tfs}px`,
    fontFamily: theme.font_serif,
    color: theme.flavor_fg,
    lineHeight: `${Math.round(tfs * 1.25)}px`,
    fontStyle: "italic",
    marginTop: "auto",
    paddingBottom: "6px",
    overflowWrap: "break-word",
    wordWrap: "break-word",
  };

  const sectionProps = {
    fontSize: tfs,
    fontFamily: theme.font_serif,
    color: theme.rules_fg,
  };

  // Build actions text
  let actionsText = "";
  if (actions.length > 0) {
    for (const action of actions) {
      if (action.name === "Spellcasting" && action.spell_list) {
        actionsText += `${action.name}: ${action.text}\n`;
        for (const sl of action.spell_list) {
          actionsText += `${sl.cooldown}: ${sl.spells.join(", ")}\n`;
        }
      } else {
        actionsText += `${action.name}: ${action.text}\n`;
      }
    }
    actionsText = actionsText.replace(/\n+$/, "");
  }

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
      <foreignObject x={rx} y={ry} width={rw} height={rh}>
        <div {...XHTML_NS} style={containerStyle}>
          <div>
            {skills.length > 0 && (
              <Section
                label="Skills"
                text={skills
                  .map(
                    (s) =>
                      `${s.name}${s.bonus >= 0 ? "+" : ""}${s.bonus}`,
                  )
                  .join(", ")}
                {...sectionProps}
              />
            )}
            {resistances.length > 0 && (
              <Section
                label="Resistances"
                text={resistances.join(", ")}
                {...sectionProps}
              />
            )}
            {immunities.length > 0 && (
              <Section
                label="Immunities"
                text={immunities.join(", ")}
                {...sectionProps}
              />
            )}
            {vulnerabilities.length > 0 && (
              <Section
                label="Vulnerabilities"
                text={vulnerabilities.join(", ")}
                {...sectionProps}
              />
            )}
            {gear.length > 0 && (
              <Section
                label="Gear"
                text={gear.join(", ")}
                {...sectionProps}
              />
            )}
            {senses.length > 0 && (
              <Section
                label="Senses"
                text={senses.join(", ")}
                {...sectionProps}
              />
            )}
            {languages.length > 0 && (
              <Section
                label="Languages"
                text={languages.join(", ")}
                {...sectionProps}
              />
            )}
            {traits.length > 0 && (
              <Section
                label="Traits"
                text={traits
                  .map((t) => `${t.name}: ${t.text}`)
                  .join("\n")}
                {...sectionProps}
              />
            )}
            {actionsText && (
              <Section
                label="Actions"
                text={actionsText}
                indented
                {...sectionProps}
              />
            )}
            {bonusActions.length > 0 && (
              <Section
                label="Bonus Actions"
                text={bonusActions
                  .map((a) => `${a.name}: ${a.text}`)
                  .join("\n")}
                {...sectionProps}
              />
            )}
            {reactions.length > 0 && (
              <Section
                label="Reactions"
                text={reactions
                  .map(
                    (r) =>
                      `${r.name}: Trigger: ${r.trigger} Response: ${r.response}`,
                  )
                  .join("\n")}
                {...sectionProps}
              />
            )}
          </div>
          {flavorText && <div style={flavorStyle}>{flavorText}</div>}
        </div>
      </foreignObject>
    </>
  );
}
