import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ListChecks,
  Timer,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDomains } from "@/lib/data";
import { domainMeta } from "@/lib/data";
import { LandingStats } from "@/components/landing-stats";

const FEATURES = [
  {
    icon: BookOpen,
    title: "30 Modul, Bahasa Santai",
    desc: "Semua task statement dijelasin pakai analogi anak tongkrongan — cocok buat yang non-IT.",
  },
  {
    icon: BrainCircuit,
    title: "Exam Traps",
    desc: "Pola-pola jawaban yang bikin banyak orang kejureum, dikumpulin per modul.",
  },
  {
    icon: ListChecks,
    title: "Concept Check",
    desc: "Kuis interaktif di tiap modul + pembahasan kenapa opsi lain salah.",
  },
  {
    icon: Timer,
    title: "Exam Simulator",
    desc: "Timer per soal 2 menit, simulasi 60 soal / 120 menit kayak ujian asli.",
  },
  {
    icon: Zap,
    title: "Cheat Sheet H-1",
    desc: "Semua decision rules & traps dipadatkan satu halaman buat review momen terakhir.",
  },
  {
    icon: ArrowRight,
    title: "Progress Tersimpan",
    desc: "Baca sampe mana udah dicatat otomatis di browser — nggak perlu login.",
  },
];

export default function HomePage() {
  const domains = getDomains();
  const totalTasks = domains.reduce((n, d) => n + d.tasks.length, 0);

  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.15),transparent)]"
        />
        <div className="container flex flex-col items-center py-20 text-center md:py-28">
          <Badge variant="secondary" className="mb-5 px-4 py-1.5 text-sm">
            🎯 CCAR-F · Claude Certified Architect (Foundations)
          </Badge>
          <h1 className="max-w-3xl font-display text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Lulus Ujian Claude,{" "}
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Tanpa Pusing
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            5 domain, {totalTasks} modul, 100+ exam traps — dijelasin pakai bahasa anak
            tongkrongan biar mahasiswa non-IT juga ngerti. Ada kuis interaktif, exam
            simulator, dan cheat sheet buat review H-1.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild className="gap-2">
              <Link href="/learn">
                Mulai Belajar <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="gap-2">
              <Link href="/exam-sim">
                <Timer className="h-4 w-4" /> Coba Exam Sim
              </Link>
            </Button>
          </div>
          <LandingStats />
        </div>
      </section>

      {/* domain weights */}
      <section className="container py-14">
        <div className="mb-8 text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">
            5 Domain Ujian & Bobotnya
          </h2>
          <p className="mt-2 text-muted-foreground">
            Bobot = porsi soal. Mulai dari yang paling berat biar effort lu ngefek maksimal.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d) => {
            const meta = domainMeta[d.num];
            return (
              <Link key={d.slug} href={`/learn/${d.slug}`} className="group">
                <Card className="h-full transition-all group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-primary/10">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-xl ${meta.color}`}
                      >
                        {meta.emoji}
                      </span>
                      <Badge variant="secondary" className="font-mono">
                        {d.weight}%
                      </Badge>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-extrabold">
                      Domain {d.num} · {meta.short}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {d.description}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-primary">
                      {d.tasks.length} modul →
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          <Card className="h-full border-dashed">
            <CardContent className="flex h-full flex-col justify-center p-5 text-center">
              <p className="font-display text-2xl font-black">60 soal · 120 menit</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pass mark 720/1000 · biaya $125 · berlaku 12 bulan
              </p>
              <Link
                href="/cheatsheet"
                className="mt-3 text-sm font-semibold text-primary hover:underline"
              >
                Lihat cheat sheet →
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* features */}
      <section className="border-t bg-muted/30 py-14">
        <div className="container">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight">
              Kenapa Belajar di Sini?
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <CardContent className="flex gap-4 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold">{f.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
