"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { domainMeta, type Domain } from "@/lib/curriculum";
import type { Task } from "@/lib/data";
import { useProgress } from "@/lib/progress";

/**
 * Client-side domain overview: needs localStorage progress, so it lives here
 * while the route page stays a server component (static prerender + metadata).
 */
export function DomainOverview({
  domain,
  tasksList,
}: {
  domain: Domain;
  tasksList: Task[];
}) {
  const { tasks } = useProgress();
  const meta = domainMeta[domain.num];

  const done = tasksList.filter(
    (t) => tasks[t.num]?.read || tasks[t.num]?.quizCorrect
  ).length;
  const pct = tasksList.length ? Math.round((done / tasksList.length) * 100) : 0;

  return (
    <div className="container max-w-3xl py-10 md:py-14">
      <Link
        href="/learn"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Semua domain
      </Link>

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl ${meta.color}`}
          >
            {meta.emoji}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Domain {domain.num} · Bobot {domain.weight}%
            </p>
            <h1 className="font-display text-2xl font-black tracking-tight md:text-3xl">
              {domain.title}
            </h1>
          </div>
        </div>
        <p className="mt-4 leading-7 text-muted-foreground">{domain.description}</p>
        <div className="mt-5 max-w-sm">
          <div className="mb-1.5 flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">
              {done}/{tasksList.length} modul selesai
            </span>
            <span className={pct === 100 ? "text-success" : "text-primary"}>{pct}%</span>
          </div>
          <ProgressBar value={pct} barClassName={pct === 100 ? "bg-success" : undefined} />
        </div>
      </header>

      <div className="space-y-3">
        {tasksList.map((t, i) => {
          const p = tasks[t.num];
          const isDone = p?.read || p?.quizCorrect;
          const quizOk = p?.quizCorrect;
          return (
            <Link key={t.num} href={`/learn/${domain.slug}/${t.taskSlug}`} className="block">
              <Card className="group transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <span className="flex h-11 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-sm font-bold text-primary">
                    {t.num}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-bold group-hover:text-primary">{t.title}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Modul {i + 1} dari {tasksList.length}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {quizOk ? (
                      <Badge variant="success" className="gap-1">
                        <HelpCircle className="h-3 w-3" /> Kuis ✓
                      </Badge>
                    ) : isDone ? (
                      <Badge variant="secondary">Dibaca</Badge>
                    ) : (
                      <Badge variant="outline">Baru</Badge>
                    )}
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between gap-3">
        <Button variant="outline" asChild>
          <Link href="/learn">
            <ArrowLeft className="h-4 w-4" /> Domain lain
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/learn/${domain.slug}/${tasksList[0]?.taskSlug}`}>
            Mulai modul pertama <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
