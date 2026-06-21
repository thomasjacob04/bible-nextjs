// 66-book order using exact names from KJV_books.name in the database.
import type { Testament } from "@/types";

export const OLD_TESTAMENT: readonly string[] = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "I Samuel", "II Samuel",
  "I Kings", "II Kings", "I Chronicles", "II Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
] as const;

export const NEW_TESTAMENT: readonly string[] = [
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "I Corinthians", "II Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "I Thessalonians", "II Thessalonians", "I Timothy",
  "II Timothy", "Titus", "Philemon", "Hebrews", "James",
  "I Peter", "II Peter", "I John", "II John", "III John",
  "Jude", "Revelation of John",
] as const;

export const ALL_BOOKS: readonly string[] = [...OLD_TESTAMENT, ...NEW_TESTAMENT];

export function testamentOf(book: string): Testament | null {
  if (OLD_TESTAMENT.includes(book)) return "Old Testament";
  if (NEW_TESTAMENT.includes(book)) return "New Testament";
  return null;
}

// URL slug: lowercase, spaces→hyphens. e.g. "I Samuel" → "i-samuel"
export function bookToSlug(book: string): string {
  return book.toLowerCase().replace(/ /g, "-");
}

// Reverse: "i-samuel" → "I Samuel" via lookup against ALL_BOOKS.
export function slugToBook(slug: string): string {
  const candidate = slug.replace(/-/g, " ");
  return (
    ALL_BOOKS.find((b) => b.toLowerCase() === candidate.toLowerCase()) ??
    candidate
  );
}
