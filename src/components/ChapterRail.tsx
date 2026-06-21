"use client";

interface Props {
  chapters: number[];
  active: number;
  onSelect: (ch: number) => void;
}

export default function ChapterRail({ chapters, active, onSelect }: Props) {
  return (
    <aside className="hidden md:flex flex-col sticky top-16 self-start h-[calc(100vh-4rem)] w-12 overflow-y-auto py-4 items-center gap-0.5 scrollbar-none">
      {chapters.map((ch) => (
        <button
          key={ch}
          onClick={() => onSelect(ch)}
          className={[
            "w-8 h-8 rounded-md text-xs font-medium flex items-center justify-center transition-colors duration-100 cursor-pointer",
            ch === active
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text)]",
          ].join(" ")}
          aria-label={`Go to chapter ${ch}`}
        >
          {ch}
        </button>
      ))}
    </aside>
  );
}
