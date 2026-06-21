"use client";
import { useState } from "react";
import type { SectionSummary } from "@/types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  section: SectionSummary;
}

export default function SectionCard({ section }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-[var(--bg-muted)] transition-colors"
      >
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] block">
            Chapters {section.section}
          </span>
          <span className="text-sm font-semibold text-[var(--text)]">{section.title}</span>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-[var(--text-muted)] shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-[var(--text-muted)] shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1">
          <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
            {section.summary}
          </p>
        </div>
      )}
    </div>
  );
}
