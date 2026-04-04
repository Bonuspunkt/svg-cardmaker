import { resolve, join } from "node:path";
import { readFileSync } from "node:fs";
import type { Plugin } from "vite";
import type { Card as CardType } from "./types/card.js";
import { buildCardMap } from "./utils/load-cards.js";
import { renderCardHtml } from "./utils/render-card-html.js";

export interface CardPluginOptions {
  cardDbPath?: string;
}

export function cardGeneratorPlugin(options?: CardPluginOptions): Plugin {
  const cardDbRel = options?.cardDbPath ?? "card-db";
  let projectRoot = "";
  let cardCss = "";
  let cardMap = new Map<string, CardType>();

  function reload() {
    cardCss = readFileSync(join(projectRoot, "src/styles/card.css"), "utf-8");
    cardMap = buildCardMap(resolve(projectRoot, cardDbRel));
  }

  function renderIndex(): string {
    const filenames = Array.from(cardMap.keys()).sort();
    const items = filenames
      .map((f) => `<li><a href="/cards/${f}">${f.replace(/\.html$/, "")}</a></li>`)
      .join("\n");
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Card Index</title></head>
<body>
<h1>Cards (${filenames.length})</h1>
<ul>${items}</ul>
</body>
</html>`;
  }

  return {
    name: "card-generator",

    configResolved(config) {
      // config.root is the resolved absolute path (e.g. /project/src when root: "src")
      // We need the actual project root where card-db/, art/, etc. live
      projectRoot = resolve(config.root, "..");
      reload();
    },

    configureServer(server) {
      const cardDbDir = resolve(projectRoot, cardDbRel);
      server.watcher.add(cardDbDir);
      server.watcher.add(join(projectRoot, "src/styles/card.css"));

      const onChange = (file: string) => {
        if (
          file.endsWith(".json") && file.startsWith(cardDbDir) ||
          file === join(projectRoot, "src/styles/card.css")
        ) {
          reload();
          server.ws.send({ type: "full-reload" });
        }
      };
      server.watcher.on("change", onChange);
      server.watcher.on("add", onChange);
      server.watcher.on("unlink", onChange);

      // Register before Vite's SPA fallback so /cards/* requests are handled here
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/cards")) return next();

        const url = req.url.replace(/\?.*$/, "");

        if (url === "/cards" || url === "/cards/" || url === "/cards/index.html") {
          res.setHeader("Content-Type", "text/html");
          res.end(renderIndex());
          return;
        }

        const match = url.match(/^\/cards\/(.+\.html)$/);
        if (!match) return next();

        const filename = match[1];
        const card = cardMap.get(filename);
        if (!card) {
          res.statusCode = 404;
          res.end(`Card not found: ${filename}`);
          return;
        }

        res.setHeader("Content-Type", "text/html");
        res.end(renderCardHtml(card, cardCss, { embedArt: false }));
      });
    },

    generateBundle() {
      // Rebuild with art embedding for self-contained output
      const freshMap = buildCardMap(resolve(projectRoot, cardDbRel));
      const freshCss = readFileSync(join(projectRoot, "src/styles/card.css"), "utf-8");

      for (const [filename, card] of freshMap) {
        this.emitFile({
          type: "asset",
          fileName: `cards/${filename}`,
          source: renderCardHtml(card, freshCss, { embedArt: true }),
        });
      }

      this.emitFile({
        type: "asset",
        fileName: "cards/index.html",
        source: renderIndex(),
      });
    },
  };
}
