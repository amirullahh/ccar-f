import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Hammer,
  TriangleAlert,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InlineText } from "@/components/lesson-blocks";
import { TongkronganPanel } from "@/components/tongkrongan-panel";
import { EnglishOriginal } from "@/components/english-original";
import { QuizCard } from "@/components/quiz-card";
import { BuildExercise } from "@/components/build-exercise";
import { ReadToggle } from "@/components/read-toggle";
import { getTask, getDomain, getTaskNeighbors, tasks as allTasks, domainMeta } from "@/lib/data";
import { annotations } from "@/lib/annotations";

export function generateStaticParams() {
  return allTasks.map((t) => ({ domain: t.domainSlug, task: t.taskSlug }));
}

export function generateMetadata({
  params,
}: {
  params: { domain: string; task: string };
}) {
  const t = getTask(params.domain, params.task);
  if (!t) return {};
  return {
    title: `Task ${t.num} — ${t.title}`,
    description: t.blocks.find((b) => b.type === "p")?.text.slice(0, 150),
  };
}

export default function TaskPage({
  params,
}: {
  params: { domain: string; task: string };
}) {
  const { domain: domainSlug, task: taskSlug } = params;
  const task = getTask(domainSlug, taskSlug);
  if (!task) notFound();

  const domain = getDomain(domainSlug);
  const meta = domain ? domainMeta[domain.num] : undefined;
  const ann = annotations[task.num];
  const { prev, next } = getTaskNeighbors(domainSlug, taskSlug);

  return (
    <div className="container max-w-3xl py-10 md:py-14">
      {/* breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/learn" className="hover:text-primary">Belajar</Link>
        <span>/</span>
        <Link href={`/learn/${domainSlug}`} className="hover:text-primary">
          Domain {task.num.split(".")[0]} · {meta?.short}
        </Link>
        <span>/</span>
        <span className="font-semibold text-foreground">Task {task.num}</span>
      </nav>

      {/* header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-mono">Task {task.num}</Badge>
          <Badge variant="outline">{domain?.title}</Badge>
          <Badge variant="secondary" className="font-mono">{domain?.weight}% bobot domain</Badge>
        </div>
        <h1 className="mt-3 font-display text-3xl font-black tracking-tight md:text-4xl">
          {task.title}
        </h1>
        {ann && (
          <div className="mt-5 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              🗣️ Inti permasalahannya, bahasa tongkrongan
            </p>
            <p className="text-[15px] leading-7">{ann.tldr}</p>
          </div>
        )}
        <ReadToggle num={task.num} />
      </header>

      {/* versi bahasa indonesia santai — panel utama buat paham konsep */}
      <TongkronganPanel num={task.num} />

      {/* teks asli (English) — sumber kebenaran istilah ujian */}
      <EnglishOriginal blocks={task.blocks} />

      {/* exam traps */}
      {task.traps.length > 0 && (
        <section aria-label="Exam traps" className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-destructive" />
            <h2 className="font-display text-xl font-extrabold tracking-tight">
              Exam Traps — Jangan Kejureum Di Sini
            </h2>
          </div>
          <div className="space-y-3">
            {task.traps.map((trap, i) => (
              <div
                key={i}
                className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
              >
                <p className="text-sm font-bold leading-6 text-destructive">
                  🚨 <InlineText text={trap.trap} />
                </p>
                {trap.why && (
                  <p className="mt-2 text-sm leading-6 text-foreground/85">
                    <InlineText text={trap.why} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* concept check */}
      {task.scenario.question && task.scenario.correct && (
        <section aria-label="Concept check" className="mb-8">
          <QuizCard
            num={task.num}
            taskTitle={task.title}
            question={task.scenario.question}
            options={task.scenario.options}
            correct={task.scenario.correct}
            explain={task.scenario.explain}
          />
        </section>
      )}

      {/* build exercise */}
      {task.build.steps.length > 0 && (
        <section aria-label="Build exercise" className="mb-8">
          <BuildExercise
            title={task.build.title}
            duration={task.build.duration}
            learn={task.build.learn}
            steps={task.build.steps}
          />
        </section>
      )}

      {/* sources */}
      {task.sources.length > 0 && (
        <section aria-label="Sources" className="mb-10">
          <h2 className="mb-3 font-display text-xl font-extrabold tracking-tight">📚 Sumber</h2>
          <ul className="space-y-2">
            {task.sources.map((s, i) => (
              <li key={i} className="text-sm">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                >
                  {s.title} <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {s.by && <span className="text-muted-foreground"> — {s.by}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* prev / next */}
      <div className="grid gap-3 border-t pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={`/learn/${prev.domainSlug}/${prev.taskSlug}`} className="group">
            <Card className="h-full transition-all group-hover:border-primary/40">
              <CardContent className="p-4">
                <p className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" /> Sebelumnya
                </p>
                <p className="mt-1 font-bold group-hover:text-primary">
                  {prev.num} — {prev.title}
                </p>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/learn/${next.domainSlug}/${next.taskSlug}`} className="group">
            <Card className="h-full text-right transition-all group-hover:border-primary/40">
              <CardContent className="p-4">
                <p className="flex items-center justify-end gap-1 text-xs font-semibold text-muted-foreground">
                  Selanjutnya <ArrowRight className="h-3.5 w-3.5" />
                </p>
                <p className="mt-1 font-bold group-hover:text-primary">
                  {next.num} — {next.title}
                </p>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Link href="/exam-sim" className="group">
            <Card className="h-full border-success/40 text-right transition-all group-hover:border-success">
              <CardContent className="p-4">
                <p className="flex items-center justify-end gap-1 text-xs font-semibold text-muted-foreground">
                  Kurikulum abis! <ArrowRight className="h-3.5 w-3.5" />
                </p>
                <p className="mt-1 font-bold text-success">
                  Coba Exam Simulator →
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* hidden hint for build coach */}
      <p className="mt-10 text-center text-xs text-muted-foreground">
        <Hammer className="mr-1 inline h-3.5 w-3.5" />
        Build exercise di atas opsional — tapi yang lulus rata-rata paham konsepnya dengan praktik.
      </p>
    </div>
  );
}
