"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { curriculum, domainMeta } from "@/lib/curriculum";
import type { TrapEntry } from "@/lib/drill";
import { cn } from "@/lib/utils";

export function CheatSheetBrowser() {
  const [entries, setEntries] = useState<TrapEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<number | "all">("all");

  useEffect(() => {
    fetch("/content/traps.json")
      .then((r) => r.json())
      .then((data: TrapEntry[]) => setEntries(data))
      .catch(() => setEntries([]))
      .finally(() => setLoaded(true));
  }, []);

  const shown = useMemo(
    () => entries.filter((t) => filter === "all" || t.domainNum === filter),
    [entries, filter]
  );

  const totalTraps = entries.reduce((n, t) => n + t.traps.length, 0);

  if (!loaded) {
    return (
      <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nyiapin cheat sheet…
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
            filter === "all" ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"
          )}
        >
          Semua <span className="opacity-60">({totalTraps})</span>
        </button>
        {curriculum.domains.map((d) => {
          const count = entries
            .filter((t) => t.domainNum === d.num)
            .reduce((n, t) => n + t.traps.length, 0);
          return (
            <button
              key={d.num}
              onClick={() => setFilter(d.num)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                filter === d.num ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"
              )}
            >
              D{d.num} · {domainMeta[d.num].short}{" "}
              <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-8">
        {shown.map((t) => (
          <section key={t.num}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                {t.num}
              </span>
              <h2 className="font-bold">{t.title}</h2>
              <span className="text-xs text-muted-foreground">
                D{t.domainNum} · {domainMeta[t.domainNum].short}
              </span>
            </div>
            <div className="space-y-2">
              {t.traps.map((trap, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-destructive/25 bg-destructive/5 p-3.5"
                >
                  <p className="flex items-start gap-2 text-sm font-semibold leading-6">
                    <TriangleAlert className="mt-1 h-4 w-4 shrink-0 text-destructive" />
                    <span>
                      <span className="text-destructive">JANGAN:</span> {trap.trap}
                    </span>
                  </p>
                  {trap.why && (
                    <p className="mt-1 pl-6 text-sm leading-6 text-muted-foreground">
                      → {trap.why}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <Link
              href={`/learn/${t.domainSlug}/${t.taskSlug}`}
              className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
            >
              Pelajari Task {t.num} →
            </Link>
          </section>
        ))}
      </div>
    </div>
  );
}
