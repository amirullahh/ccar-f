"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  RotateCcw,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { curriculum, domainMeta, exam } from "@/lib/curriculum";
import { getIstilahCards, type TrapEntry } from "@/lib/drill";
import { resetProgress, useProgress } from "@/lib/progress";

export function ProgressDashboard() {
  const { tasks, drill, examRuns, diagnostics } = useProgress();
  const [trapCounts, setTrapCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    fetch("/content/traps.json")
      .then((r) => r.json())
      .then((data: TrapEntry[]) => {
        const counts: Record<number, number> = {};
        for (const t of data) counts[t.domainNum] = (counts[t.domainNum] ?? 0) + t.traps.length;
        setTrapCounts(counts);
      })
      .catch(() => setTrapCounts({}));
  }, []);

  const istilahCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const c of getIstilahCards()) counts[c.domainNum] = (counts[c.domainNum] ?? 0) + 1;
    return counts;
  }, []);

  const drillKnownByDomain = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const id of Object.keys(drill)) {
      // id berbentuk "trap-1.1-0" atau "istilah-3.2-4"
      const num = id.split("-")[1] ?? "";
      const d = Number(num.split(".")[0]);
      if (d) counts[d] = (counts[d] ?? 0) + 1;
    }
    return counts;
  }, [drill]);

  const totalTasks = curriculum.domains.reduce((n, d) => n + d.tasks.length, 0);
  const doneTasks = Object.values(tasks).filter((t) => t.read || t.quizCorrect).length;
  const quizOk = Object.values(tasks).filter((t) => t.quizCorrect).length;
  const totalCards = Object.values(trapCounts).reduce((a, b) => a + b, 0) +
    Object.values(istilahCounts).reduce((a, b) => a + b, 0);
  const knownCards = Object.keys(drill).length;
  const overallPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // task berikutnya yang belum disentuh — biar user nggak mikir mau mulai dari mana
  const nextTask = useMemo(() => {
    for (const d of curriculum.domains) {
      for (const t of d.tasks) {
        if (!tasks[t.num]?.read && !tasks[t.num]?.quizCorrect) {
          return { num: t.num, title: t.title, domainSlug: d.slug, taskSlug: t.url.split("/").pop() ?? "" };
        }
      }
    }
    return null;
  }, [tasks]);

  const lastExam = examRuns[examRuns.length - 1];
  const bestExam = examRuns.reduce(
    (best, r) => (r.score / Math.max(1, r.total) > best.ratio ? { ratio: r.score / Math.max(1, r.total), run: r } : best),
    { ratio: -1, run: undefined as (typeof examRuns)[number] | undefined }
  );

  return (
    <div className="space-y-8">
      {/* ringkasan */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Modul disentuh", value: `${doneTasks}/${totalTasks}`, icon: CheckCircle2 },
          { label: "Kuis bener", value: `${quizOk}`, icon: Flame },
          { label: "Kartu drill kuat", value: totalCards ? `${knownCards}/${totalCards}` : `${knownCards}`, icon: TrendingUp },
          { label: "Skor ujian terakhir", value: lastExam ? `${lastExam.score}/${lastExam.total}` : "—", icon: Timer },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <s.icon className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="mt-2 font-display text-2xl font-black">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* progres keseluruhan */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-lg font-extrabold">Progres keseluruhan</h2>
            <span className={overallPct === 100 ? "font-bold text-success" : "font-bold text-primary"}>
              {overallPct}%
            </span>
          </div>
          <ProgressBar value={overallPct} barClassName={overallPct === 100 ? "bg-success" : undefined} />
          <p className="mt-3 text-sm text-muted-foreground">
            {nextTask ? (
              <>
                Lanjut dari sini bre:{" "}
                <Link
                  href={`/learn/${nextTask.domainSlug}/${nextTask.taskSlug}`}
                  className="font-semibold text-primary hover:underline"
                >
                  Task {nextTask.num} — {nextTask.title} →
                </Link>
              </>
            ) : (
              <span className="font-semibold text-success">
                Semua {totalTasks} modul udah lu sentuh. Mantap — sekarang jagain di exam simulator. 🏆
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* per domain */}
      <section>
        <h2 className="mb-4 font-display text-xl font-extrabold">Progres per domain</h2>
        <div className="space-y-3">
          {curriculum.domains.map((d) => {
            const t = tasks;
            const total = d.tasks.length;
            const seen = d.tasks.filter((x) => t[x.num]?.read || t[x.num]?.quizCorrect).length;
            const ok = d.tasks.filter((x) => t[x.num]?.quizCorrect).length;
            const cards = (trapCounts[d.num] ?? 0) + (istilahCounts[d.num] ?? 0);
            const known = drillKnownByDomain[d.num] ?? 0;
            const pct = total ? Math.round((seen / total) * 100) : 0;
            const meta = domainMeta[d.num];
            return (
              <Card key={d.slug}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-xl ${meta.color}`}>
                      {meta.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Domain {d.num} · bobot {d.weight}%
                      </p>
                      <h3 className="font-bold">{meta.short}</h3>
                    </div>
                    <Button variant="outline" size="sm" asChild className="gap-1.5">
                      <Link href={`/learn/${d.slug}`}>
                        Lanjut <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <div className="mb-1 flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Modul</span>
                        <span>
                          {seen}/{total}
                        </span>
                      </div>
                      <ProgressBar value={pct} barClassName={pct === 100 ? "bg-success" : undefined} />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Kuis bener</span>
                        <span>
                          {ok}/{total}
                        </span>
                      </div>
                      <ProgressBar value={total ? (ok / total) * 100 : 0} barClassName={ok === total ? "bg-success" : undefined} />
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Kartu kuat</span>
                        <span>
                          {known}/{cards || "—"}
                        </span>
                      </div>
                      <ProgressBar value={cards ? (known / cards) * 100 : 0} barClassName={cards && known === cards ? "bg-success" : undefined} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* riwayat */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Timer className="h-4 w-4 text-primary" /> Riwayat exam simulator
            </CardTitle>
          </CardHeader>
          <CardContent>
            {examRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada. Cobain{" "}
                <Link href="/exam-sim" className="font-semibold text-primary hover:underline">
                  exam simulator
                </Link>{" "}
                buat ngukur posisi lu sekarang.
              </p>
            ) : (
              <ul className="space-y-2">
                {[...examRuns].reverse().slice(0, 6).map((r, i) => {
                  const pct = Math.round((r.score / Math.max(1, r.total)) * 100);
                  return (
                    <li key={i} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                      <span className="text-muted-foreground">
                        {new Date(r.date).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Badge variant={pct >= 72 ? "success" : "destructive"} className="font-mono">
                          {r.score}/{r.total}
                        </Badge>
                        <span className="font-semibold">~{Math.round((r.score / Math.max(1, r.total)) * 1000)}/1000</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {bestExam.run && (
              <p className="mt-3 text-xs text-muted-foreground">
                Skor terbaik: <strong className="text-foreground">{bestExam.run.score}/{bestExam.run.total}</strong>{" "}
                (pass mark setara {Math.round((720 / 1000) * bestExam.run.total)} benar di skala {bestExam.run.total} soal)
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-4 w-4 text-primary" /> Riwayat diagnostic
            </CardTitle>
          </CardHeader>
          <CardContent>
            {diagnostics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada. Ambil{" "}
                <Link href="/diagnostic" className="font-semibold text-primary hover:underline">
                  diagnostic test
                </Link>{" "}
                buat tau domain mana yang paling perlu dikejar.
              </p>
            ) : (
              <ul className="space-y-3">
                {[...diagnostics].reverse().slice(0, 4).map((d, i) => (
                  <li key={i} className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">
                      {new Date(d.date).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(d.byDomain).map(([num, v]) => (
                        <Badge
                          key={num}
                          variant={v.ok / Math.max(1, v.total) >= 0.7 ? "success" : "destructive"}
                          className="font-mono text-[10px]"
                        >
                          D{num} {v.ok}/{v.total}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {/* reset */}
      <div className="flex flex-col items-center gap-2 border-t pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Progres disimpan di browser ini aja (localStorage) — nggak ada akun, nggak ada
          data yang dikirim ke mana pun. Ujian aslinya {exam.questions} soal / {exam.minutes} menit,
          pass mark {exam.passMark}.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => {
            if (window.confirm("Hapus semua progres belajar, kartu drill, dan riwayat ujian? Nggak bisa dibalikin ya bre.")) {
              resetProgress();
            }
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset semua progres
        </Button>
      </div>
    </div>
  );
}
