import Link from "next/link";
import { OLD_TESTAMENT, NEW_TESTAMENT, bookToSlug } from "@/lib/books";
import { BOOK_META } from "@/lib/bookMeta";
import { BookOpen } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import RecentSidebar from "@/components/RecentSidebar";

function TestamentColumn({
  title,
  books,
}: {
  title: string;
  books: readonly string[];
}) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4 pb-2 border-b border-[var(--border)]">
        {title}
      </h2>
      <ul className="space-y-0.5">
        {books.map((book) => {
          const meta = BOOK_META[book];
          return (
            <li key={book}>
              <Link
                href={`/books/${bookToSlug(book)}/`}
                className="flex items-baseline justify-between gap-4 px-3 py-2 rounded-lg hover:bg-[var(--bg-muted)] group transition-colors duration-150"
              >
                <span className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors shrink-0">
                  {book}
                </span>
                {meta && (
                  <span className="text-right text-xs text-[var(--text-subtle)] leading-snug min-w-0">
                    <span className="block truncate">{meta.author} · {meta.location}</span>
                    <span className="block text-[var(--text-subtle)] opacity-75">{meta.date}</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg)] border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <BookOpen size={22} className="text-[var(--accent)]" />
          <h1 className="text-lg font-semibold text-[var(--text)]">
            Holy Bible <span className="text-[var(--text-subtle)] font-normal text-sm">KJV</span>
          </h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Body: sidebar + book grid */}
      <div className="flex min-h-screen">
        <RecentSidebar />
        <main className="flex-1 min-w-0 px-6 py-8">
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-10">
            <TestamentColumn title="Old Testament" books={OLD_TESTAMENT} />
            <TestamentColumn title="New Testament" books={NEW_TESTAMENT} />
          </div>
        </main>
      </div>
    </div>
  );
}
