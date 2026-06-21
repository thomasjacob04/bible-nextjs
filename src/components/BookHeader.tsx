"use client";
import Link from "next/link";
import { BookOpen, ChevronLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface Props {
  book: string;
}

export default function BookHeader({ book }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-[var(--bg)] border-b border-[var(--border)] px-4 py-3">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors text-sm"
        >
          <ChevronLeft size={16} />
          Books
        </Link>
        <span className="text-[var(--border)]">|</span>
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-[var(--accent)]" />
          <span className="font-semibold text-[var(--text)] text-sm">{book}</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
