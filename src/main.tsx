import { useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Card } from "./components/Card.js";
import type { Card as CardType } from "./types/card.js";
import { isSpellCard, isMonsterCard } from "./types/card.js";
import { expandCard } from "./utils/expand-card.js";
import "./styles/card.css";
import styles from "./styles/preview.module.css";

const cardModules = import.meta.glob("../card-db/*.json", { eager: true }) as Record<
  string,
  { cards?: CardType[] }
>;

const rawCards: CardType[] = Object.values(cardModules)
  .flatMap((mod) => mod.cards ?? []);

function getCardGroup(card: CardType): string {
  if (isSpellCard(card)) return "Spells";
  if (isMonsterCard(card)) return "Monsters";
  if ((card.type_line ?? "").includes("Weapon")) return "Weapons";
  return "Items";
}

function toId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function App() {
  const [tentMode, setTentMode] = useState(true);

  const groupEntries = useMemo(() => {
    const allCardPages: CardType[][] = rawCards.map((card) => expandCard(card, tentMode));

    const grouped = new Map<string, CardType[][]>();
    for (const pages of allCardPages) {
      const group = pages.some(isMonsterCard) ? "Monsters"
        : pages.some(isSpellCard) ? "Spells"
        : getCardGroup(pages[0]);
      if (!grouped.has(group)) grouped.set(group, []);
      grouped.get(group)!.push(pages);
    }

    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [tentMode]);

  return (
    <>
      <nav className={`no-print ${styles.nav}`}>
        {groupEntries.map(([name]) => (
          <a
            key={name}
            href={`#${toId(name)}`}
            className={styles.navLink}
          >
            {name}
          </a>
        ))}
        <button
          className={styles.toggleBtn}
          onClick={() => setTentMode((prev) => !prev)}
        >
          {tentMode ? "Multi-Page" : "Tent Card"}
        </button>
      </nav>
      <div className={styles.content}>
        {groupEntries.map(([name, cards]) => (
          <section key={name} id={toId(name)} className={styles.section}>
            <h2 className={`no-print ${styles.sectionHeading}`}>
              {name} ({cards.length}{cards.length === 1 ? " card" : " cards"})
            </h2>
            <div className={styles.cardGrid}>
              {cards.map((pages, i) => (
                <div key={i} className={styles.cardGroup}>
                  {pages.map((card, j) => (
                    <Card key={j} card={card} tentMode={tentMode} />
                  ))}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
