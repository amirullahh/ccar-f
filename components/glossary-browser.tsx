"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InlineText } from "@/components/lesson-blocks";
import { curriculum, domainMeta } from "@/lib/curriculum";
import { tongkrongan } from "@/lib/tongkrongan";
import { cn } from "@/lib/utils";

interface Entry {
  term: string;
  arti: string;
  nums: string[];
  domainNums: number[];
  domainSlug: string;
  taskSlug: string;
}

/**
 * Gabungin semua istilah dari 30 modul, dedupe per istilah.
 * Kalau istilah yang sama muncul di beberapa modul, artinya digabung
 * (ambil penjelasan terpanjang) dan daftar modulnya dikumpulin.
 */
function buildEntries(): Entry[] {
  const idx = new Map<string, { title: string; domainSlug: string; taskSlug: string }>();
  for (const d of curriculum.domains) {
    for (const t of d.tasks) {
      idx.set(t.num, {
        title: t.title,
        domainSlug: d.slug,
        taskSlug: t.url.split("/").pop() ?? "",
      });
    }
  }

  const map = new Map<string, Entry>();
  for (const [num, tg] of Object.entries(tongkrongan)) {
    const meta = idx.get(num);
    if (!meta) continue;
    const domainNum = Number(num.split(".")[0]);
    for (const it of tg.istilah) {
      const key = it.term.trim().toLowerCase();
      const existing = map.get(key);
      if (existing) {
        if (!existing.nums.includes(num)) existing.nums.push(num);
        if (!existing.domainNums.includes(domainNum)) existing.domainNums.push(domainNum);
        if (it.arti.length > existing.arti.length) existing.arti = it.arti;
      } else {
        map.set(key, {
          term: it.term.trim(),
          arti: it.arti,
          nums: [num],
          domainNums: [domainNum],
          domainSlug: meta.domainSlug,
          taskSlug: meta.taskSlug,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.term.localeCompare(b.term, "en"));
}

export function GlossaryBrowser() {
  const entries = useMemo(buildEntries, []);
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState<number | "all">("all");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (domain !== "all" && !e.domainNums.includes(domain)) return false;
      if (!needle) return true;
      return (e.term + " " + e.arti).toLowerCase().includes(needle);
    });
  }, [entries, q, domain]);

  const domainCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const e of entries) {
      for (const d of e.domainNums) counts[d] = (counts[d] ?? 0) + 1;
    }
    return counts;
  }, [entries]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari istilah… (mis. stop_reason, allowedTools, provenance)"
            aria-label="Cari istilah"
            className="h-11 w-full rounded-xl border bg-card pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Bersihkan pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground sm:whitespace-nowrap">
          <strong className="text-foreground">{shown.length}</strong> dari {entries.length} istilah
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setDomain("all")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
            domain === "all" ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"
          )}
        >
          Semua domain
        </button>
        {curriculum.domains.map((d) => (
          <button
            key={d.num}
            onClick={() => setDomain(d.num)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
              domain === d.num ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"
            )}
          >
            D{d.num} · {domainMeta[d.num].short}{" "}
            <span className="opacity-60">({domainCounts[d.num] ?? 0})</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nggak ketemu istilah itu. Coba kata kunci lain, bre.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {shown.map((e) => (
            <Card key={e.term} className="transition-colors hover:border-primary/40">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[13px] font-bold text-primary">
                    {e.term}
                  </code>
                  {e.domainNums.map((d) => (
                    <Badge key={d} variant="outline" className="font-mono text-[10px]">
                      D{d}
                    </Badge>
                  ))}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  <InlineText text={e.arti} />
                </p>
                <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs" asChild>
                  <Link href={`/learn/${e.domainSlug}/${e.taskSlug}`}>
                    Muncul di Task {e.nums.join(", ")} →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
