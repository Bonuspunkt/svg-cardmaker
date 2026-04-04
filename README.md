# svg-cardmaker

A flexible, scriptable card generator for RPGs, board games, and collectible card systems — built with React, TypeScript, and Vite.
Originally built for D&D-style magic items, spells, and monsters, but works for any kind of custom card design.

## Features

- **Modular JSON card database** — split your cards into multiple files (e.g. `weapons.json`, `spells_a.json`, `mon_goblins.json`)
- **Three card types** — items (with art), spells (info grid), and monsters (stat blocks with auto-splitting for long entries)
- **Live preview** — Vite dev server with hot reload for instant card previews
- **Automatic theming** — frame color adapts to rarity (Common → Legendary)
- **Batch rendering** — generate standalone HTML files for all cards
- **Print-ready PDFs** — combine cards into A4 sheets with crop marks via Puppeteer
- **Open format** — everything is plain JSON, HTML/CSS, and TypeScript

---

## Example Card Definition

Each card is a JSON object stored in a file inside the `card-db/` folder:

```json
{
  "cards": [
    {
      "name": "Club",
      "rarity": "Common",
      "type_line": "Item — Simple Melee Weapon",
      "rules_text": [
        "Proficiency with a Club allows you to add your proficiency bonus to the attack roll for any attack you make with it.",
        "",
        " • Damage: 1d4 Bludgeoning",
        " • Light"
      ],
      "flavor_text": "",
      "set_code": "MYR",
      "collector": "101/999 U",
      "author": "wschu",
      "copyright": "© Myrdell Homebrew 2025",
      "art_path": "art/club.png",
      "pt": "1d4",
      "price": "1 SP",
      "weight": "2 lb"
    }
  ]
}
```

---

## Usage

### Live preview

```bash
npm run dev
```

Starts a Vite dev server at `localhost:5173` showing all cards with hot reload.

### Generate HTML cards

```bash
npm run generate
```

Loads all `.json` files from `card-db/`, renders each card as a standalone HTML file into `out_cards/`.

You can also specify custom input/output paths:

```bash
npm run generate -- -i card-db -o out_cards
```

### Print to PDF

```bash
npm run print -- --cards out_cards --all --out print.pdf
```

Generates a printable A4 PDF with all cards arranged in a grid with crop marks.

To print specific cards with quantities:

```bash
npm run print -- --cards out_cards --add "Potion_of_Healing=3" --add "Potion_of_Greater_Healing=2" --out print.pdf
```

### Type checking

```bash
npm run typecheck
```

### Tests

```bash
npx playwright test
```

---

## Requirements

- Node.js 18+
- npm
