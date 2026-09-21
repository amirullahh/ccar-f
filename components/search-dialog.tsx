"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/primitives";
import { DOMAIN_LABELS, cn } from "@/lib/utils";

interface SearchItem {
  num: string;
  title: string;
  domainSlug: string;
  taskSlug: string;
  domainNum: number;
  traps: string[];
  concept: string;
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState<SearchItem[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open || items.length) return;
    fetch("/content/search-index.json")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, [open, items.length]);

  // keyboard shortcut "/"
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = /input|textarea/i.test(target.tagName) || target.isContentEditable;
      if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((it) =>
      [it.num, it.title, it.concept, ...it.traps].join(" ").toLowerCase().includes(needle)
    );
  }, [items, q]);

  function go(it: SearchItem) {
    onOpenChange(false);
    router.push(`/learn/${it.domainSlug}/${it.taskSlug}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-w-xl p-0">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari konsep, exam trap, atau task… (mis. stop_reason)"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <DialogTitle className="sr-only">Cari materi</DialogTitle>
        <DialogDescription className="sr-only">
          Cari konsep di seluruh modul
        </DialogDescription>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {q ? "Nggak ketemu. Coba kata kunci lain, bre." : "Ketik buat nyari di 30 modul."}
            </p>
          )}
          {results.map((it) => (
            <button
              key={it.num}
              onClick={() => go(it)}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent"
            >
              <span className="mt-0.5 flex h-7 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">
                {it.num}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{it.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  Domain {it.domainNum} · {DOMAIN_LABELS[it.domainNum]}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className={cn("border-t px-4 py-2 text-[11px] text-muted-foreground")}>
          {results.length} dari {items.length} modul
        </div>
      </DialogContent>
    </Dialog>
  );
}
