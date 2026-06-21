"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  if (dark === null) return null; // avoid flash

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="ml-auto p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
