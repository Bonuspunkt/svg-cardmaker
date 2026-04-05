import { defineConfig } from "vite";
import { resolve } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { extname } from "node:path";
import { cardGeneratorPlugin } from "./src/vite-plugin-cards.js";

export default defineConfig({
  root: "src",
  publicDir: false,
  server: {
    host: "0.0.0.0",
    fs: {
      allow: [".."],
    },
  },
  plugins: [
    {
      name: "serve-art",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith("/art/")) return next();
          const url = req.url.split("?")[0];
          const filePath = resolve(process.cwd(), url.slice(1));
          if (!existsSync(filePath)) return next();
          const ext = extname(filePath).toLowerCase();
          const mime =
            ext === ".svg" ? "image/svg+xml" :
            ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
          res.setHeader("Content-Type", mime);
          res.end(readFileSync(filePath));
        });
      },
    },
    cardGeneratorPlugin(),
  ],
});
