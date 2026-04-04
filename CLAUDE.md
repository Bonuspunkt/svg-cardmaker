# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

D&D card generator that renders RPG cards (items, spells, monsters) from JSON definitions into HTML using React server-side rendering. Cards are defined in `card-db/*.json` and output as individual HTML files. A Vite dev server provides a live preview of all cards, and Puppeteer generates printable A4 PDFs.

## Commands

- `npm run dev` — start Vite dev server (preview all cards at localhost:5173)
- `npm run generate` — generate HTML card files from `card-db/` into `out_cards/` (uses `tsx src/generate-cards.tsx`)
- `npm run generate -- -i card-db -o out_cards` — with explicit input/output paths
- `npm run print -- --cards out_cards --all --out print.pdf` — generate printable PDF with all cards
- `npm run print -- --cards out_cards --add "Potion_of_Healing=3" --out print.pdf` — specific cards with counts
- `npm run typecheck` — TypeScript type checking (`tsc --noEmit`)
- `npx playwright test` — run Playwright tests (auto-starts Vite dev server)
- `npx playwright test tests/preview.spec.ts` — run a single test file

## Architecture

**Dual rendering modes:** Cards render identically in two contexts:
1. **CLI generation** (`src/generate-cards.tsx`) — uses `renderToStaticMarkup` to produce standalone HTML files, embeds art as data URIs via `src/utils/image.ts`
2. **Browser preview** (`src/main.tsx`) — Vite dev server with hot reload, loads card JSON via `import.meta.glob`, art served by custom Vite plugin in `vite.config.ts`

**Card type system** (`src/types/card.ts`): Three card types discriminated by `card_type` field:
- `ItemCard` (default, no `card_type`) — has art, type line, rules, optional PT/price/weight boxes
- `SpellCard` (`card_type: "spell"`) — spell info grid instead of art
- `MonsterCard` (`card_type: "monster"`) — stat block, traits, actions; auto-splits into continuation cards via `src/utils/expand-card.ts`

**Theme/layout** (`src/theme/`): All dimensions are in **centimeters**. `getTheme()` computes section positions based on card type. `themeToCssVars()` converts the theme to CSS custom properties. Rarity determines frame color via `src/theme/colors.ts`.

**Component hierarchy:** `Card` → dispatches to `ItemCard`/`SpellCard`/`MonsterCard` → each assembles `CardFrame`, `TitleBar`, type-specific sections (`ArtSection`/`SpellTypeGrid`/`MonsterStatBlock`), `RulesBox`/`MonsterRulesBox`, `OptionalBoxes`, `Footer`. Styling is in `src/styles/card.css` using CSS custom properties from the theme.

**Print pipeline** (`src/collect-and-print.tsx`): Assembles card HTML files into `PrintLayout` component (A4 grid with crop marks), renders to PDF via Puppeteer.

## Development Environment

**Dev container** (`.devcontainer/`): Ubuntu-based container with Node LTS and Python 3.12. `post-create.sh` installs system deps for pycairo/Pillow/lxml, sets up a Python venv from `requirements.txt`, and bootstraps Claude Code permissions.

**CI** (`.github/workflows/ci.yml`): Runs on push/PR to `main`. Steps: `npm ci` → typecheck → Playwright tests (Chromium). Test results uploaded as artifacts (7-day retention).
