// scripts/spa-fallback.cjs
const fs = require("fs");
const path = require("path");

const src = path.resolve(__dirname, "..", "dist", "index.html");
const dest = path.resolve(__dirname, "..", "dist", "404.html");

if (!fs.existsSync(src)) {
  console.error("Erreur: dist/index.html introuvable. Lance d'abord: npm run build");
  process.exit(1);
}

try {
  fs.copyFileSync(src, dest);
  console.log("SPA fallback OK: dist/404.html créé");
} catch (e) {
  console.error("Échec de la création du fallback:", e);
  process.exit(1);
}
