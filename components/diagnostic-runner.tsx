"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Compass,
  Play,
  RotateCcw,
  TriangleAlert,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { InlineText } from "@/components/lesson-blocks";
import { curriculum, domainMeta } from "@/lib/curriculum";
import { addDiagnostic } from "@/lib/progress";
import { cn } from "@/lib/utils";

interface Q {
  id: string;
  domainNum: number;
  domainTitle: string;
  domainSlug: string;
  taskSlug: string;
  taskTitle: string;
  question: string;
  options: { letter: string; text: string }[];
  correct: string | null;
  explain: Record<string, string>;
}

type Phase = "intro" | "running" | "result";

const PER_DOMAIN = 3;

function sample(pool: Q[]): Q[] {
  const picked: Q[] = [];
  for (const d of curriculum.domains) {
    const inDomain = pool.filter((q) => q.domainNum === d.num);
    const shuffled = [...inDomain].sort(() => Math.random() - 0.5).slice(0, PER_DOMAIN);
    picked.push(...shuffled);
  }
  return picked;
}

export function DiagnosticRunner() {
  const [pool, setPool] = useState<Q[]>([]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/content/questions.json")
      .then((r) => r.json())
      .then((data: Q[]) => setPool(data.filter((q) => q.correct && q.options.length)))
      .catch(() => setPool([]));
  }, []);

  const result = useMemo(() => {
    if (phase !== "result") return null;
    const byDomain: Record<number, { ok: number; total: number; title: string; slug: string }> = {};
    for (const q of qs) {
      byDomain[q.domainNum] = byDomain[q.domainNum] ?? {
        ok: 0,
        total: 0,
        title: q.domainTitle,
        slug: q.domainSlug,
      };
      byDomain[q.domainNum].total++;
      if (picks[q.id] === q.correct) byDomain[q.domainNum].ok++;
    }
    const totalOk = qs.filter((q) => picks[q.id] === q.correct).length;
    const weakest = Object.entries(byDomain)
      .map(([num, v]) => ({ num: Number(num), ratio: v.ok / Math.max(1, v.total), ...v }))
      .sort((a, b) => a.ratio - b.ratio)[0];
    return { byDomain, totalOk, total: qs.length, weakest };
  }, [phase, qs, picks]);

  useEffect(() => {
    if (phase !== "result" || !result || saved) return;
    setSaved(true);
    const byDomain: Record<string, { ok: number; total: number }> = {};
    for (const [num, v] of Object.entries(result.byDomain)) {
      byDomain[num] = { ok: v.ok, total: v.total };
    }
    addDiagnostic(byDomain);
  }, [phase, result, saved]);

  function start() {
    setQs(sample(pool));
    setI(0);
    setPicks({});
    setSaved(false);
    setPhase("running");
  }

  /* ---------------- INTRO ---------------- */
  if (phase === "intro") {
    const count = Math.min(PER_DOMAIN, 3) * curriculum.domains.length;
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl shadow-lg shadow-violet-500/30">
            🧭
          </span>
          <h2 className="mt-5 font-display text-2xl font-black">
            Tes dulu, baru belajar
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
            {count} soal ({PER_DOMAIN} dari tiap domain), <strong>tanpa timer</strong> dan
            tanpa pembahasan sampai selesai — biar hasilnya jujur. Ujungnya lu dapet
            gambaran domain mana yang paling perlu dikejar duluan.
          </p>
          <Button
            size="lg"
            className="mt-6 gap-2"
            onClick={start}
            disabled={pool.length === 0}
          >
            <Play className="h-4 w-4" />
            {pool.length === 0 ? "Nyiapin soal…" : "Gas mulai diagnostic"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ---------------- RUNNING ---------------- */
  if (phase === "running" && qs[i]) {
    const q = qs[i];
    const picked = picks[q.id];
    return (
      <div>
        <div className="mb-5 flex items-center justify-between gap-3">
          <Badge variant="secondary" className="font-mono">
            Soal {i + 1}/{qs.length}
          </Badge>
          <Badge variant="outline">
            D{q.domainNum} · {domainMeta[q.domainNum]?.short}
          </Badge>
        </div>
        <ProgressBar value={(i / qs.length) * 100} className="mb-6" />

        <Card>
          <CardContent className="p-6">
            <p className="text-[15px] font-medium leading-7">{q.question}</p>
            <div className="mt-5 space-y-2.5">
              {q.options.map((opt) => (
                <button
                  key={opt.letter}
                  onClick={() => setPicks((p) => ({ ...p, [q.id]: opt.letter }))}
                  aria-pressed={picked === opt.letter}
                  className={cn(
                    "group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm leading-6 transition-all",
                    picked === opt.letter
                      ? "border-primary bg-primary/10"
                      : "hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                      picked === opt.letter
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground group-hover:border-primary group-hover:text-primary"
                    )}
                  >
                    {opt.letter}
                  </span>
                  <InlineText text={opt.text} />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-5 flex justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setI((cur) => Math.max(0, cur - 1))}
            disabled={i === 0}
          >
            ← Sebelumnya
          </Button>
          <Button
            size="sm"
            disabled={!picked}
            className="gap-1.5"
            onClick={() => {
              if (i + 1 >= qs.length) setPhase("result");
              else setI((cur) => cur + 1);
            }}
          >
            {i + 1 >= qs.length ? "Lihat hasil" : "Lanjut"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  /* ---------------- RESULT ---------------- */
  if (phase === "result" && result) {
    const projected = Math.round((result.totalOk / Math.max(1, result.total)) * 1000);
    const weak = result.weakest;
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <span className="text-5xl">{projected >= 720 ? "🎉" : "🧭"}</span>
            <h2 className="mt-3 font-display text-2xl font-black">
              {result.totalOk}/{result.total} benar
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Proyeksi skala 1000: <strong>{projected}</strong> · pass mark 720
            </p>

            <div className="mt-6 space-y-3 text-left">
              {Object.entries(result.byDomain)
                .sort((a, b) => Number(a[0]) - Number(b[0]))
                .map(([num, v]) => {
                  const pct = Math.round((v.ok / Math.max(1, v.total)) * 100);
                  return (
                    <div key={num}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="font-semibold">
                          D{num} · {domainMeta[Number(num)]?.short}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {v.ok}/{v.total}
                        </span>
                      </div>
                      <ProgressBar
                        value={pct}
                        barClassName={pct >= 70 ? "bg-success" : "bg-destructive"}
                      />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {weak && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Compass className="h-3.5 w-3.5" /> Rekomendasi urutan belajar
              </p>
              <p className="mt-2 text-[15px] leading-7">
                Domain paling lemah lu sekarang{" "}
                <strong>
                  D{weak.num} · {domainMeta[weak.num]?.short}
                </strong>{" "}
                ({weak.ok}/{weak.total} bener). Mulai dari situ dulu — jangan dari yang
                udah lu bisa, nanti waktunya kepakai.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild className="gap-1.5">
                  <Link href={`/learn/${weak.slug}`}>
                    Belajar D{weak.num} sekarang <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="gap-1.5">
                  <Link href="/drill">Drill dulu 15 menit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <section>
          <h2 className="mb-3 font-display text-xl font-extrabold">Review jawaban</h2>
          <div className="space-y-3">
            {qs.map((q) => {
              const picked = picks[q.id];
              const ok = picked === q.correct;
              return (
                <Card key={q.id} className={ok ? "border-success/30" : "border-destructive/30"}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {ok ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                      <Badge variant="outline" className="font-mono">
                        {q.id}
                      </Badge>
                      <Badge variant="secondary">{q.taskTitle}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6">{q.question}</p>
                    {picked && q.explain[picked] && (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        <span className={cn("font-bold", ok ? "text-success" : "text-destructive")}>
                          Pilihan lu ({picked}):
                        </span>{" "}
                        <InlineText text={q.explain[picked]} />
                      </p>
                    )}
                    {!ok && q.correct && (
                      <p className="mt-1.5 text-sm leading-6">
                        <span className="font-bold text-success">Jawaban benar ({q.correct}):</span>{" "}
                        <InlineText text={q.explain[q.correct] ?? ""} />
                      </p>
                    )}
                    <Link
                      href={`/learn/${q.domainSlug}/${q.taskSlug}`}
                      className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                    >
                      Pelajari modulnya →
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={start} className="gap-1.5">
            <RotateCcw className="h-4 w-4" /> Ulang diagnostic
          </Button>
          <Button asChild>
            <Link href="/progress">
              Lihat dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <TriangleAlert className="h-3.5 w-3.5" />
          Ini cuma 3 soal per domain — buat arah belajar, bukan pengganti exam simulator.
        </p>
      </div>
    );
  }

  return null;
}
