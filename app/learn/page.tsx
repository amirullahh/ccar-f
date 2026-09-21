"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { getDomains, domainMeta } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";

export default function LearnPage() {
  const domains = getDomains();
  const { tasks } = useProgress();

  return (
    <div className="container py-10 md:py-14">
      <header className="mb-10 text-center">
        <Badge variant="secondary" className="mb-3">📚 Core Syllabus</Badge>
        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
          Pilih Domain Buat Dipelajari
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Urutan disarankan: mulai dari bobot terbesar (Agentic Architecture 27%), lanjut
          Claude Code & Prompt Engineering (20% each), baru Tool Design (18%) dan Context
          Management (15%). Bobot = porsi soal di ujian.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {domains.map((d) => {
          const meta = domainMeta[d.num];
          const total = d.tasks.length;
          const done = d.tasks.filter(
            (t) => tasks[t.num]?.read || tasks[t.num]?.quizCorrect
          ).length;
          const quizDone = d.tasks.filter((t) => tasks[t.num]?.quizCorrect).length;
          const pct = total ? Math.round((done / total) * 100) : 0;

          return (
            <Card key={d.slug} className="group relative overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-2xl ${meta.color}`}>
                      {meta.emoji}
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        DOMAIN {String(d.num).padStart(2, "0")}
                      </p>
                      <h2 className="font-display text-xl font-extrabold">{meta.short}</h2>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-mono text-sm">
                    {d.weight}%
                  </Badge>
                </div>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">{d.description}</p>

                <div className="mt-5">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">
                      Progres lu: {done}/{total} modul · {quizDone} kuis bener
                    </span>
                    <span className={pct === 100 ? "text-success" : "text-primary"}>{pct}%</span>
                  </div>
                  <ProgressBar value={pct} barClassName={pct === 100 ? "bg-success" : undefined} />
                </div>

                <Button asChild className="mt-5 w-full gap-2 group-hover:gap-3">
                  <Link href={`/learn/${d.slug}`}>
                    {done === 0 ? "Mulai Domain Ini" : done === total ? "Review Lagi" : "Lanjutkan"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Udah pede? Langsung tes diri di{" "}
        <Link href="/exam-sim" className="font-semibold text-primary hover:underline">
          Exam Simulator
        </Link>{" "}
        atau nyekrup{" "}
        <Link href="/cheatsheet" className="font-semibold text-primary hover:underline">
          Cheat Sheet
        </Link>
        .
      </p>
    </div>
  );
}
