"use client";
import { useEffect, useState } from "react";
import { initBibleDb, type OnProgress } from "@/lib/bibleDb";
import type { Database } from "sql.js";

interface Props {
  onReady: (db: Database) => void;
}

export default function DbLoadingBanner({ onReady }: Props) {
  const [phase, setPhase] = useState<"idle" | "downloading" | "ready">("idle");

  useEffect(() => {
    const handleProgress: OnProgress = (p) => {
      if (p === "downloading") setPhase("downloading");
      if (p === "ready" || p === "cached") setPhase("ready");
    };

    initBibleDb(handleProgress).then(onReady).catch(console.error);
  }, [onReady]);

  if (phase !== "downloading") return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-[var(--accent)] text-white text-center py-3 px-4 text-sm shadow-md">
      <span className="mr-2">📥</span>
      Downloading Bible database&hellip;{" "}
      <span className="opacity-75">(one-time, then cached offline)</span>
    </div>
  );
}
