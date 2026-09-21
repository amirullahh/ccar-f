"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  MousePointerClick,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { InlineText } from "@/components/lesson-blocks";
import { curriculum, domainMeta } from "@/lib/curriculum";
import { getIstilahCards, trapCardsFrom, type DrillCard, type TrapEntry } from "@/lib/drill";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Kind = "all" | "trap" | "istilah";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function DrillBoard() {
  const { drill, toggleDrill } = useProgress();
  const [trapCards, setTrapCards] = useState<DrillCard[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [kind, setKind] = useState<Kind>("all");
  const [domain, setDomain] = useState<number | "all">("all");
  const [hideKnown, setHideKnown] = useState(false);
  const [order, setOrder] = useState<string[] | null>(null);
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    fetch("/content/traps.json")
      .then((r) => r.json())
      .then((data: TrapEntry[]) => setTrapCards(trapCardsFrom(data)))
      .catch(() => setTrapCards([]))
      .finally(() => setLoaded(true));
  }, []);

  const allCards = useMemo(
    () => [...trapCards, ...getIstilahCards()],
    [trapCards]
  );

  const pool = useMemo(() => {
    return allCards.filter((c) => {
      if (kind !== "all" && c.kind !== kind) return false;
      if (domain !== "all" && c.domainNum !== domain) return false;
      return true;
    });
  }, [allCards, kind, domain]);

  const knownIds = useMemo(() => Object.keys(drill), [drill]);

  const ordered = useMemo(() => {
    const base = hideKnown ? pool.filter((c) => !drill[c.id]) : pool;
    if (!order) return base;
    const byId = new Map(base.map((c) => [c.id, c]));
    const out = order.map((id) => byId.get(id)).filter(Boolean) as DrillCard[];
    // kartu baru yang belum masuk urutan ditambahkan di belakang
    for (const c of base) if (!order.includes(c.id)) out.push(c);
    return out;
  }, [pool, order, hideKnown, drill]);

  const idx = Math.min(i, Math.max(0, ordered.length - 1));
  const card = ordered[idx];

  const resetOrder = useCallback(() => {
    setOrder(null);
    setI(0);
    setRevealed(false);
  }, []);

  // kalau filter berubah, urutan & posisi direset biar nggak nyasar
  useEffect(() => {
    resetOrder();
  }, [kind, domain, hideKnown, resetOrder]);

  function next() {
    setRevealed(false);
    setI((cur) => (cur + 1 < ordered.length ? cur + 1 : 0));
  }
  function prev() {
    setRevealed(false);
    setI((cur) => (cur - 1 >= 0 ? cur - 1 : Math.max(0, ordered.length - 1)));
  }
  function markKnown() {
    if (!card) return;
    toggleDrill(card.id);
    next();
  }

  const knownInPool = pool.filter((c) => drill[c.id]).length;
  const pct = pool.length ? Math.round((knownInPool / pool.length) * 100) : 0;

  if (!loaded) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          Nyiapin kartu…
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* kontrol */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Jenis
          </span>
          {(
            [
              ["all", "Semua"],
              ["trap", "🚨 Jebakan Ujian"],
              ["istilah", "📖 Istilah Kunci"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setKind(value)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                kind === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-primary/50"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Domain
          </span>
          <button
            onClick={() => setDomain("all")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
              domain === "all" ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"
            )}
          >
            Semua
          </button>
          {curriculum.domains.map((d) => (
            <button
              key={d.num}
              onClick={() => setDomain(d.num)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                domain === d.num
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-primary/50"
              )}
            >
              D{d.num} <span className="opacity-60">({d.weight}%)</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOrder(shuffle(ordered.map((c) => c.id)));
              setI(0);
              setRevealed(false);
            }}
            className="gap-1.5"
          >
            <Shuffle className="h-3.5 w-3.5" /> Acak urutan
          </Button>
          <Button
            variant={hideKnown ? "secondary" : "outline"}
            size="sm"
            onClick={() => setHideKnown((v) => !v)}
            className="gap-1.5"
            aria-pressed={hideKnown}
          >
            <Eye className="h-3.5 w-3.5" />
            {hideKnown ? "Nampilin yang udah kuat" : "Sembunyikan yang udah kuat"}
          </Button>
          <Button variant="ghost" size="sm" onClick={resetOrder} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Ulang dari awal
          </Button>
        </div>
      </div>

      {/* progres */}
      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
          <span className="text-muted-foreground">
            Udah kuat: {knownInPool}/{pool.length} kartu · total {allCards.length} kartu
          </span>
          <span className={pct === 100 ? "text-success" : "text-primary"}>{pct}%</span>
        </div>
        <ProgressBar value={pct} barClassName={pct === 100 ? "bg-success" : undefined} />
      </div>

      {/* kartu */}
      {!card ? (
        <Card className="border-success/40">
          <CardContent className="p-10 text-center">
            <p className="text-4xl">🏆</p>
            <h2 className="mt-3 font-display text-xl font-black">
              Semua kartu di filter ini udah lu tandai kuat!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ganti filter domain, atau matiin &ldquo;sembunyikan yang udah kuat&rdquo; buat
              ngulang dari awal.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setHideKnown(false)}
            >
              Tampilkan semua kartu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-5 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={card.kind === "trap" ? "destructive" : "default"}>
                    {card.kind === "trap" ? "🚨 Jebakan Ujian" : "📖 Istilah Kunci"}
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    Task {card.num}
                  </Badge>
                  <Badge variant="secondary">
                    D{card.domainNum} · {domainMeta[card.domainNum].short}
                  </Badge>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {idx + 1}/{ordered.length}
                </span>
              </div>

              <div className="px-6 py-8">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {card.kind === "trap" ? "Jebakan yang harus lu tolak" : "Istilah ujian"}
                </p>
                <p className="mt-2 text-lg font-bold leading-8">
                  <InlineText text={card.front} />
                </p>

                {!revealed ? (
                  <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <MousePointerClick className="h-4 w-4" /> Klik buat liat jawabannya
                  </button>
                ) : (
                  <div className="mt-6 animate-fade-up rounded-xl border border-success/30 bg-success/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-success">
                      {card.kind === "trap" ? "Kenapa salah" : "Artinya"}
                    </p>
                    <p className="mt-1.5 text-[15px] leading-7">
                      <InlineText text={card.back} />
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-4">
                <Button variant="outline" size="sm" onClick={prev} className="gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" /> Sebelumnya
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={drill[card.id] ? "secondary" : "default"}
                    onClick={markKnown}
                    className="gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {drill[card.id] ? "Batalin tanda kuat" : "Udah kuat, lanjut"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={next} className="gap-1.5">
                    Lewatin <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Materi lengkapnya di{" "}
            <Link
              href={`/learn/${card.domainSlug}/${card.taskSlug}`}
              className="font-semibold text-primary hover:underline"
            >
              Task {card.num} — {card.taskTitle}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
