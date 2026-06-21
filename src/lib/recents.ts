// localStorage helpers for recent chapter history.
import type { RecentRef } from "@/types";

const KEY = "recentChapters";
const MAX = 10;

export function loadRecents(): RecentRef[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as RecentRef[];
  } catch {
    return [];
  }
}

export const RECENTS_UPDATED_EVENT = "recentsUpdated";

// Deduplicates on book+chapter — verse just refines the same entry.
export function saveRecentRef(book: string, chapter: number, verse?: number): void {
  const refs = loadRecents().filter(
    (r) => !(r.book === book && r.chapter === chapter),
  );
  refs.unshift({ book, chapter, ...(verse !== undefined ? { verse } : {}) });
  if (refs.length > MAX) refs.length = MAX;
  try {
    localStorage.setItem(KEY, JSON.stringify(refs));
    window.dispatchEvent(new CustomEvent(RECENTS_UPDATED_EVENT));
  } catch {
    // storage full — ignore
  }
}
