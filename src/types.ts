// Shared types for the KJV Bible reader.

export type Testament = "Old Testament" | "New Testament";

export interface Verse {
  verse: number;
  text: string;
}

// A chapter is just an ordered list of verses keyed by chapter number elsewhere.
export type ChaptersMap = Record<number, Verse[]>;

export interface SectionSummary {
  section: string; // e.g. "1-11"
  title: string;
  summary: string;
  startChapter: number;
  endChapter: number;
}

export type BookSummaries = Record<string, string>;
export type SectionSummariesByBook = Record<string, SectionSummary[]>;

export interface RecentRef {
  book: string;
  chapter: number;
  verse?: number;
}
