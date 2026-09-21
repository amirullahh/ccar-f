"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flag,
  Play,
  RotateCcw,
  Timer,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { ProgressBar } from "../../components/ui/progress";
import { InlineText } from "../../components/lesson-blocks";
import { addExamRun } from "../../lib/progress";
import { cn } from "../../lib/utils";
import type { Question } from "../../lib/data";

const TIME_PER_Q = 120; // detik — exam asli: 120 menit / 60 soal

type Phase = "setup" | "running" | "result";

interface AnswerLog {
  q: Question;
  chosen: string | null;
  correct: boolean;
  timedOut: boolean;
}

export default function ExamSimPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [count, setCount] = useState(20);
  const [pool, setPool] = useState<Question[]>([]);
  const [qs, setQs] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerLog[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const savedRef = useRef(false);

  useEffect(() => {
    fetch("/content/questions.json")
      .then((r) => r.json())
      .then((data: Question[]) => {
        const only = data.filter((q) => q.correct);
        setPool(only);
      })
      .catch(() => setPool([]));
  }, []);

  const current = qs[idx];

  const finish = useCallback(() => {
    setPhase("result");
  }, []);

  const pick = useCallback(
    (letter: string | null, timedOut = false) => {
      if (!current) return;
      const log: AnswerLog = {
        q: current,
        chosen: letter,
        correct: letter === current.correct,
        timedOut,
      };
      setAnswers((prev) => {
        const next = prev.filter((a) => a.q.id !== current.id);
        return [...next, log];
      });
      if (idx + 1 >= qs.length) finish();
      else {
        setIdx((i) => i + 1);
        setTimeLeft(TIME_PER_Q);
      }
    },
    [current, idx, qs.length, finish]
  );

  // timer
  useEffect(() => {
    if (phase !== "running" || !current) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          pick(null, true);
          return TIME_PER_Q;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, idx, current, pick]);

  function start() {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    setQs(shuffled);
    setIdx(0);
    setAnswers([]);
    setFlagged(new Set());
    setTimeLeft(TIME_PER_Q);
    savedRef.current = false;
    setPhase("running");
  }

  // simpan hasil sekali
  useEffect(() => {
    if (phase === "result" && answers.length && !savedRef.current) {
      savedRef.current = true;
      const score = answers.filter((a) => a.correct).length;
      addExamRun(score, answers.length);
    }
  }, [phase, answers]);

  const result = useMemo(() => {
    if (phase !== "result") return null;
    const correct = answers.filter((a) => a.correct).length;
    const byDomain: Record<number, { ok: number; total: number }> = {};
    for (const a of answers) {
      const d = a.q.domainNum;
      byDomain[d] = byDomain[d] || { ok: 0, total: 0 };
      byDomain[d].total++;
      if (a.correct) byDomain[d].ok++;
    }
    return { correct, total: answers.length, byDomain };
  }, [phase, answers]);

  /* ---------------- SETUP ---------------- */
  if (phase === "setup") {
    return (
      <div className="container max-w-xl py-14">
        <Card>
          <CardContent className="p-8 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl shadow-lg shadow-violet-500/30">
              ⏱️
            </span>
            <h1 className="mt-5 font-display text-3xl font-black">Exam Simulator</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Ujian aslinya: <strong>60 soal · 120 menit · pass 720/1000</strong>. Di sini
              lu dengerin timer 2 menit per soal — latih nalar nge-spot trap di bawah tekanan.
              Soal diambil acak dari 30 scenario resmi.
            </p>

            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Jumlah soal:</p>
              <div className="flex justify-center gap-2">
                {[10, 20, 30].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={cn(
                      "rounded-xl border px-5 py-2.5 font-bold transition-all",
                      count === n
                        ? "border-primary bg-primary text-primary-foreground shadow"
                        : "hover:border-primary/50"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {pool.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {pool.length} soal tersedia di bank soal
                </p>
              )}
            </div>

            <Button size="lg" className="mt-6 w-full gap-2" onClick={start} disabled={pool.length === 0}>
              <Play className="h-4 w-4" /> Gas Mulai Ujian
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Timer jalan otomatis pas soal pertama muncul. Nggak ada jalan balik — kayak ujian asli.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------- RUNNING ---------------- */
  if (phase === "running" && current) {
    const pctTime = (timeLeft / TIME_PER_Q) * 100;
    return (
      <div className="container max-w-2xl py-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Badge variant="secondary" className="font-mono">
            Soal {idx + 1}/{qs.length}
          </Badge>
          <Badge variant="secondary">{current.domainTitle}</Badge>
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-sm font-bold",
              timeLeft <= 20 ? "animate-pulse border-destructive text-destructive" : "border-border"
            )}
          >
            <Timer className="h-4 w-4" />
            {String(Math.floor(timeLeft / 60)).padStart(1, "0")}:
            {String(timeLeft % 60).padStart(2, "0")}
          </span>
        </div>
        <ProgressBar
          value={pctTime}
          className="mb-6"
          barClassName={timeLeft <= 20 ? "bg-destructive" : undefined}
        />

        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-[15px] font-medium leading-7">{current.question}</p>
            <div className="mt-5 space-y-2.5">
              {current.options.map((opt) => (
                <button
                  key={opt.letter}
                  onClick={() => pick(opt.letter)}
                  className="group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm leading-6 transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-bold text-muted-foreground group-hover:border-primary group-hover:text-primary">
                    {opt.letter}
                  </span>
                  <InlineText text={opt.text} />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="ghost" size="sm" onClick={finish} className="text-muted-foreground">
            Akhiri ujian ({answers.length}/{qs.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFlagged((prev) => new Set(prev).add(idx));
            }}
            className={cn("gap-1.5", flagged.has(idx) && "text-amber-500")}
          >
            <Flag className="h-3.5 w-3.5" /> {flagged.has(idx) ? "Ditandai" : "Tandai ragu"}
          </Button>
        </div>
      </div>
    );
  }

  /* ---------------- RESULT ---------------- */
  if (phase === "result" && result) {
    const scorePct = Math.round((result.correct / Math.max(1, result.total)) * 100);
    const projected = Math.round((result.correct / Math.max(1, result.total)) * 1000);
    const pass = projected >= 720;
    return (
      <div className="container max-w-2xl py-10">
        <Card className={cn("overflow-hidden", pass ? "border-success/40" : "border-destructive/40")}>
          <CardContent className="p-8 text-center">
            <span className="text-5xl">{pass ? "🎉" : "💪"}</span>
            <h1 className="mt-3 font-display text-3xl font-black">
              {result.correct} / {result.total} benar
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Proyeksi skala 1000: <strong>{projected}</strong> · Pass mark 720
            </p>
            <div
              className={cn(
                "mx-auto mt-4 w-fit rounded-full px-5 py-2 font-bold",
                pass ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"
              )}
            >
              {pass
                ? "Kalau ini ujian asli — LU LOLOS 🏆"
                : "Belum tembus 720. Review modul yang merah, gas lagi!"}
            </div>

            <div className="mt-7 space-y-3 text-left">
              <p className="text-sm font-bold">Breakdown per domain:</p>
              {Object.entries(result.byDomain).map(([d, v]) => (
                <div key={d} className="rounded-xl border p-3">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-semibold">Domain {d}</span>
                    <span className="font-mono text-muted-foreground">
                      {v.ok}/{v.total}
                    </span>
                  </div>
                  <ProgressBar
                    value={(v.ok / Math.max(1, v.total)) * 100}
                    barClassName={v.ok / v.total >= 0.7 ? "bg-success" : "bg-destructive"}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <h2 className="mb-3 mt-8 font-display text-xl font-extrabold">Review jawaban lu:</h2>
        <div className="space-y-3">
          {answers.map((a, i) => (
            <Card key={i} className={a.correct ? "border-success/30" : "border-destructive/30"}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {a.correct ? (
                    <Check className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <Badge variant="outline" className="font-mono">{a.q.id}</Badge>
                  <Badge variant="secondary">{a.q.taskTitle}</Badge>
                  {a.timedOut && <Badge variant="destructive">Waktu habis</Badge>}
                </div>
                <p className="mt-2 text-sm leading-6">{a.q.question}</p>
                {a.chosen && a.q.explain[a.chosen] && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    <span className={cn("font-bold", a.correct ? "text-success" : "text-destructive")}>
                      Pilihan lu ({a.chosen}):
                    </span>{" "}
                    <InlineText text={a.q.explain[a.chosen]} />
                  </p>
                )}
                {!a.correct && a.q.correct && (
                  <p className="mt-1.5 text-sm leading-6">
                    <span className="font-bold text-success">Jawaban benar ({a.q.correct}):</span>{" "}
                    <InlineText text={a.q.explain[a.q.correct] ?? a.q.options.find((o) => o.letter === a.q.correct)?.text ?? ""} />
                  </p>
                )}
                {!a.correct && (
                  <Link
                    href={`/learn/${a.q.domainSlug}/${a.q.taskSlug}`}
                    className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                  >
                    Pelajari modulnya →
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" onClick={() => setPhase("setup")}>
            <RotateCcw className="h-4 w-4" /> Ujian baru
          </Button>
          <Button asChild>
            <Link href="/learn">
              <ArrowLeft className="h-4 w-4" /> Kembali belajar
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-xl py-14 text-center">
      <p className="text-muted-foreground">Nggak ada soal. Coba refresh ya bre.</p>
      <Button variant="outline" asChild className="mt-4">
        <Link href="/learn">
          <ArrowRight className="h-4 w-4" /> Ke halaman belajar
        </Link>
      </Button>
    </div>
  );
}
