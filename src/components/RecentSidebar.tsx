"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { RecentRef } from "@/types";
import { loadRecents, RECENTS_UPDATED_EVENT } from "@/lib/recents";
import { bookToSlug } from "@/lib/books";

export default function RecentSidebar() {
  // null = not yet hydrated (avoids mismatch)
  const [recents, setRecents] = useState<RecentRef[] | null>(null);

  useEffect(() => {
    setRecents(loadRecents());

    // Same-tab updates (chapter rail / verse click)
    const onUpdate = () => setRecents(loadRecents());
    window.addEventListener(RECENTS_UPDATED_EVENT, onUpdate);

    // Cross-tab updates
    const onStorage = (e: StorageEvent) => {
      if (e.key === "recentChapters") setRecents(loadRecents());
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(RECENTS_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Hide on mobile, hide if not yet hydrated
  if (recents === null) return null;

  return (
    <aside className="hidden lg:flex flex-col sticky top-16 self-start h-[calc(100vh-4rem)] w-48 border-r border-[var(--border)] py-4 px-3 overflow-y-auto shrink-0">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={13} className="text-[var(--text-subtle)]" />
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-subtle)]">
          Recent
        </span>
      </div>

      {recents.length === 0 ? (
        <p className="text-xs text-[var(--text-subtle)] px-1">No recent chapters</p>
      ) : (
        <ul className="space-y-0.5">
          {recents.map((r) => (
            <li key={`${r.book}-${r.chapter}`}>
              <Link
                href={`/books/${bookToSlug(r.book)}/#chapter-${r.chapter}`}
                className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--accent)] transition-colors border-l-2 border-transparent hover:border-[var(--accent)]"
              >
                <span className="truncate">{r.book}</span>
                <span className="text-[var(--text-subtle)] shrink-0">
                  {r.verse !== undefined ? `${r.chapter}:${r.verse}` : r.chapter}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
