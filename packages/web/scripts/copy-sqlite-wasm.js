import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const sqliteWasmDir = dirname(
  require.resolve("@sqlite.org/sqlite-wasm/package.json"),
);
const src = join(sqliteWasmDir, "dist");
const dest = join(__dirname, "..", "public", "sqlite-wasm");

mkdirSync(dest, { recursive: true });

const files = [
  "sqlite3.wasm",
  "sqlite3-worker1.mjs",
  "sqlite3-opfs-async-proxy.js",
  "index.mjs",
];

for (const file of files) {
  cpSync(join(src, file), join(dest, file));
  console.log(`  ✓ ${file}`);
}

console.log(`\n✅ SQLite WASM assets copied to public/sqlite-wasm/`);
