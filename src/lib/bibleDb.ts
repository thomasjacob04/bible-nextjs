"use client";
// Client-side Bible DB: downloads KJV.db once, caches it in IndexedDB,
// then queries it in-browser via sql.js.
import type { SqlJsStatic, Database } from "sql.js";
import type { Verse, ChaptersMap } from "@/types";

const IDB_NAME = "BibleDB";
const IDB_VERSION = 1;
const IDB_STORE = "database";
const IDB_KEY = "kjv";

let _db: Database | null = null;
let _initPromise: Promise<Database> | null = null;

// ── IndexedDB helpers ───────────────────────────────────────────────────────

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      (e.target as IDBOpenDBRequest).result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

async function loadFromIdb(): Promise<Uint8Array | null> {
  const idb = await openIdb();
  return new Promise((resolve) => {
    const tx = idb.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
    req.onsuccess = () => { idb.close(); resolve(req.result ?? null); };
    req.onerror = () => { idb.close(); resolve(null); };
  });
}

async function saveToIdb(data: Uint8Array): Promise<void> {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readwrite");
    const req = tx.objectStore(IDB_STORE).put(data, IDB_KEY);
    req.onsuccess = () => { idb.close(); resolve(); };
    req.onerror = () => { idb.close(); reject(req.error); };
  });
}

// ── Public API ──────────────────────────────────────────────────────────────

export type OnProgress = (phase: "cached" | "downloading" | "ready") => void;

export async function initBibleDb(onProgress?: OnProgress): Promise<Database> {
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    // Load sql.js (wasm served from /sql/)
    const initSqlJs: (config: object) => Promise<SqlJsStatic> = (
      await import("sql.js")
    ).default as unknown as (config: object) => Promise<SqlJsStatic>;

    const SQL = await initSqlJs({
      locateFile: () => "/sql/sql-wasm.wasm",
    });

    // Try cache first
    let bytes = await loadFromIdb();

    if (bytes) {
      onProgress?.("cached");
    } else {
      onProgress?.("downloading");
      const res = await fetch("/database/KJV.db");
      const buf = await res.arrayBuffer();
      bytes = new Uint8Array(buf);
      await saveToIdb(bytes);
    }

    const db = new SQL.Database(bytes);
    onProgress?.("ready");
    _db = db;
    return db;
  })();

  return _initPromise;
}

export function getDb(): Database | null {
  return _db;
}

// ── Query helpers ───────────────────────────────────────────────────────────

export function queryChapters(db: Database, bookName: string): ChaptersMap {
  const stmt = db.prepare(`
    SELECT v.chapter, v.verse, v.text
    FROM KJV_verses v
    JOIN KJV_books b ON b.id = v.book_id
    WHERE b.name = :book
    ORDER BY v.chapter, v.verse
  `);
  stmt.bind({ ":book": bookName });

  const map: ChaptersMap = {};
  while (stmt.step()) {
    const row = stmt.getAsObject() as { chapter: number; verse: number; text: string };
    if (!map[row.chapter]) map[row.chapter] = [];
    map[row.chapter].push({ verse: row.verse, text: row.text } as Verse);
  }
  stmt.free();
  return map;
}
