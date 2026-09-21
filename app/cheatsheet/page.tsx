import type { Metadata } from "next";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CheatSheetBrowser } from "@/components/cheatsheet-browser";

export const metadata: Metadata = {
  title: "Cheat Sheet — Semua Exam Traps",
  description:
    "Semua 117 pola jawaban yang harus ditolak di ujian CCAR-F, dikumpulkan per modul. Bahan nyekrup H-1.",
};

export default function CheatSheetPage() {
  return (
    <div className="container max-w-4xl py-10 md:py-14">
      <header className="mb-8 text-center">
        <Badge variant="secondary" className="mb-3 gap-1">
          <Zap className="h-3.5 w-3.5" /> Review H-1
        </Badge>
        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
          Cheat Sheet — Semua Exam Traps
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Semua pola jawaban yang harus lu <strong>REJECT</strong> di ujian, dikumpulin
          dari 30 modul. Nyekrup ini sebelum masuk ruang ujian, bre.
        </p>
      </header>

      <CheatSheetBrowser />
    </div>
  );
}
