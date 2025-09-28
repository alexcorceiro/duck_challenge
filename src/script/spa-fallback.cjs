import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
const src = "./dist/index.html";
const dest = "./dist/404.html";
if (!existsSync(dirname(dest))) mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log("SPA fallback OK: dist/404.html créé");
