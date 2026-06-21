"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Database } from "sql.js";
import { queryChapters } from "@/lib/bibleDb";
import type { ChaptersMap, SectionSummary, SectionSummariesByBook } from "@/types";
import { saveRecentRef } from "@/lib/recents";
import ChapterRail from "@/components/ChapterRail";
import SectionCard from "@/components/SectionCard";

interface Props {
  db: Database;
  book: string;
}

export default function BookReader({ db, book }: Props) {
  const [chapters, setChapters] = useState<ChaptersMap>({});
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [activeChapter, setActiveChapter] = useState(1);
  const chapterRefs = useRef<Record<number, HTMLElement | null>>({});

  // Load chapters from DB + section summaries from JSON
  useEffect(() => {
    const map = queryChapters(db, book);
    setChapters(map);
    if (Object.keys(map).length > 0) setActiveChapter(Number(Object.keys(map)[0]));

    fetch("/data/section_summaries.json")
      .then((r) => r.json())
      .then((all: SectionSummariesByBook) => setSections(all[book] ?? []))
      .catch(() => {});
  }, [db, book]);

  // Scroll to hash once chapters are in the DOM
  useEffect(() => {
    if (Object.keys(chapters).length === 0) return;
    const hash = window.location.hash; // e.g. "#chapter-6"
    if (!hash) return;
    // rAF ensures the chapter <section> elements have been painted
    requestAnimationFrame(() => {
      const el = document.querySelector(hash);
      if (!el) return;
      const offset = 64;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      const ch = Number(hash.replace("#chapter-", ""));
      if (!isNaN(ch)) setActiveChapter(ch);
    });
  }, [chapters]);

  // Scroll-spy: update activeChapter as user scrolls
  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight / 2;
      for (const [ch, el] of Object.entries(chapterRefs.current)) {
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= mid && rect.bottom >= mid) {
          setActiveChapter(Number(ch));
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [book]);

  const scrollToChapter = useCallback((ch: number) => {
    const el = chapterRefs.current[ch];
    if (!el) return;
    const offset = 64;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    saveRecentRef(book, ch);
  }, [book]);

  const chapterNums = Object.keys(chapters).map(Number).sort((a, b) => a - b);

  // Map startChapter → section for O(1) lookup
  const sectionByStart = Object.fromEntries(sections.map((s) => [s.startChapter, s]));

  return (
    <div className="relative flex">
      {/* Scrollable content */}
      <div className="flex-1 max-w-2xl mx-auto px-4 py-6 pb-24">
        {chapterNums.map((ch) => (
          <div key={ch}>
            {/* Section summary before first chapter of that section */}
            {sectionByStart[ch] && <SectionCard section={sectionByStart[ch]} />}

            {/* Chapter */}
            <section
              id={`chapter-${ch}`}
              ref={(el) => { chapterRefs.current[ch] = el; }}
              className="mb-10"
            >
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
                Chapter {ch}
              </h3>
              <div className="space-y-3">
                {chapters[ch]?.map((v) => (
                  <p
                    key={v.verse}
                    onClick={() => saveRecentRef(book, ch, v.verse)}
                    className="text-[var(--text)] leading-relaxed text-sm cursor-pointer hover:bg-[var(--bg-muted)] rounded px-1 -mx-1 transition-colors"
                  >
                    <sup className="text-[var(--text-subtle)] mr-1.5 text-xs">{v.verse}</sup>
                    {v.text}
                  </p>
                ))}
              </div>
            </section>
          </div>
        ))}
      </div>

      {/* Chapter rail — sticky right */}
      {chapterNums.length > 0 && (
        <ChapterRail
          chapters={chapterNums}
          active={activeChapter}
          onSelect={scrollToChapter}
        />
      )}
    </div>
  );
}
