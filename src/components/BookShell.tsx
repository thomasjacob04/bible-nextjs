"use client";
import { useState, useCallback } from "react";
import type { Database } from "sql.js";
import DbLoadingBanner from "@/components/DbLoadingBanner";
import BookReader from "@/components/BookReader";
import RecentSidebar from "@/components/RecentSidebar";
import BookHeader from "@/components/BookHeader";

interface Props {
  book: string;
}

export default function BookShell({ book }: Props) {
  const [db, setDb] = useState<Database | null>(null);
  const handleReady = useCallback((d: Database) => setDb(d), []);

  return (
    <>
      <DbLoadingBanner onReady={handleReady} />
      <BookHeader book={book} />
      <div className="flex min-h-screen bg-[var(--bg)]">
        <RecentSidebar />
        <main className="flex-1 min-w-0">
          {db ? (
            <BookReader db={db} book={book} />
          ) : (
            <div className="flex items-center justify-center h-64 text-[var(--text-subtle)] text-sm">
              Loading…
            </div>
          )}
        </main>
      </div>
    </>
  );
}
