// Convert CSV summaries to JSON and stage static assets in /public.
// Run with: npm run prepare-data
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Normalize any CSV book-name variant → exact KJV_books.name from the DB.
const BOOK_NAME_MAP = {
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
function normalizeBook(name) {
  return BOOK_NAME_MAP[name] ?? name;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Minimal RFC 4180-ish CSV parser: handles quoted fields with commas, embedded
// newlines, and "" escapes. Returns array of arrays (first row is header).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        field = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else {
        field += c;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function toObjects(rows) {
  const [header, ...data] = rows;
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

// --- book_summaries.csv -> { [dbBookName]: summary }
const bookCsv = readFileSync(resolve(root, "database/book_summaries.csv"), "utf8");
const bookRows = toObjects(parseCsv(bookCsv));
const bookSummaries = Object.fromEntries(
  bookRows.map((r) => [normalizeBook(r.book), r.summary]),
);

// --- section_summaries.csv -> { [bookName]: SectionSummary[] sorted by startChapter }
const secCsv = readFileSync(resolve(root, "database/section_summaries.csv"), "utf8");
const secRows = toObjects(parseCsv(secCsv));
const sectionSummaries = {};
for (const r of secRows) {
  const [startRaw, endRaw] = String(r.section).split("-");
  const startChapter = parseInt(startRaw, 10);
  const endChapter = parseInt(endRaw ?? startRaw, 10);
  if (!Number.isFinite(startChapter)) continue;
  const entry = {
    section: r.section,
    title: r.title,
    summary: r.summary,
    startChapter,
    endChapter: Number.isFinite(endChapter) ? endChapter : startChapter,
  };
  (sectionSummaries[normalizeBook(r.book)] ??= []).push(entry);
}
for (const k of Object.keys(sectionSummaries)) {
  sectionSummaries[k].sort((a, b) => a.startChapter - b.startChapter);
}

// --- write JSON
ensureDir(resolve(root, "public/data"));
writeFileSync(
  resolve(root, "public/data/book_summaries.json"),
  JSON.stringify(bookSummaries),
);
writeFileSync(
  resolve(root, "public/data/section_summaries.json"),
  JSON.stringify(sectionSummaries),
);

// --- stage KJV.db
ensureDir(resolve(root, "public/database"));
copyFileSync(
  resolve(root, "database/KJV.db"),
  resolve(root, "public/database/KJV.db"),
);

// --- stage sql.js wasm (sql.js loads sql-wasm.wasm at runtime via locateFile)
ensureDir(resolve(root, "public/sql"));
copyFileSync(
  resolve(root, "node_modules/sql.js/dist/sql-wasm.wasm"),
  resolve(root, "public/sql/sql-wasm.wasm"),
);

console.log(
  `prepared: ${Object.keys(bookSummaries).length} book summaries, ` +
    `${Object.keys(sectionSummaries).length} books with section summaries, ` +
    `KJV.db + sql-wasm.wasm staged`,
);
