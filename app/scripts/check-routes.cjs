const fs = require("node:fs");
const path = require("node:path");

const distDir = path.join(__dirname, "..", "dist", "assets");

const bundle = fs
  .readdirSync(distDir)
  .find((f) => f.startsWith("index-") && f.endsWith(".js"));

if (!bundle) {
  throw new Error("Nie znaleziono pliku index-*.js w dist/assets");
}

const contents = fs.readFileSync(path.join(distDir, bundle), "utf8");

if (!/\/chat\/conv\/:convId/.test(contents)) {
  throw new Error("Brak trasy /chat/conv/:convId w bundle! Build przerwany.");
}

if (/window\.location\.hash/.test(contents)) {
  console.log("[OK] Wykryto fallback hash -> /chat/conv/…");
} else {
  console.warn(
    "[WARN] Nie znaleziono fallbacku hash -> /chat/conv/. Upewnij się, że hook nadal istnieje."
  );
}

console.log("[OK] Bundle zawiera routing /chat oraz /chat/conv/:convId.");
