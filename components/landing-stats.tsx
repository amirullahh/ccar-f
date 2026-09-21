"use client";

import { useEffect, useState } from "react";
import { getProgress } from "@/lib/progress";

export function LandingStats() {
  const [done, setDone] = useState<number | null>(null);

  useEffect(() => {
    const p = getProgress();
    const count = Object.values(p.tasks).filter((t) => t.read || t.quizCorrect).length;
    setDone(count);
  }, []);

  return (
    <p className="mt-6 text-sm text-muted-foreground">
      {done === null ? (
        "—"
      ) : done === 0 ? (
        <>
          Belum ada progres tercatat —{" "}
          <span className="font-semibold text-primary">mulai dari Domain 1 (27%) ya bre.</span>
        </>
      ) : (
        <>
          Progres lu:{" "}
          <span className="font-bold text-success">{done} modul</span> udah disentuh. Gas terus! 🔥
        </>
      )}
    </p>
  );
}
