// One-time fix: remap old CSV book names to exact KJV_books.name in JSON files.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const MAP = {
  "1 Samuel": "I Samuel", "2 Samuel": "II Samuel",
  "1 Kings": "I Kings",   "2 Kings": "II Kings",
  "1 Chronicles": "I Chronicles", "2 Chronicles": "II Chronicles",
  "1 Corinthians": "I Corinthians", "2 Corinthians": "II Corinthians",
  "1 Thessalonians": "I Thessalonians", "2 Thessalonians": "II Thessalonians",
  "1 Timothy": "I Timothy", "2 Timothy": "II Timothy",
  "1 Peter": "I Peter", "2 Peter": "II Peter",
  "1 John": "I John", "2 John": "II John", "3 John": "III John",
  "Revelation": "Revelation of John",
};

function fixKeys(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[MAP[k] ?? k] = v;
  }
  return out;
}

const bsPath = resolve(root, "public/data/book_summaries.json");
const ssPath = resolve(root, "public/data/section_summaries.json");

const bs = JSON.parse(readFileSync(bsPath, "utf8"));
const ss = JSON.parse(readFileSync(ssPath, "utf8"));

const bsFixed = fixKeys(bs);
const ssFixed = fixKeys(ss);

writeFileSync(bsPath, JSON.stringify(bsFixed));
writeFileSync(ssPath, JSON.stringify(ssFixed));

const bsChecks = ["I Samuel","II Samuel","I Kings","I Chronicles","I Corinthians","I John","III John","Revelation of John"];
console.log("book_summaries keys:");
bsChecks.forEach(k => console.log(" ", k, bsFixed[k] ? "✓" : "✗ MISSING"));
console.log("section_summaries keys:");
bsChecks.forEach(k => console.log(" ", k, ssFixed[k] ? "✓" : "(none)"));
