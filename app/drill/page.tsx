import type { Metadata } from "next";
import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DrillBoard } from "@/components/drill-board";

export const metadata: Metadata = {
  title: "Drill — Flashcard Cepat",
  description:
    "Hafalan cepat 117 exam traps dan istilah kunci CCAR-F pakai flashcard: depan jebakannya, belakang alasannya.",
};

export default function DrillPage() {
  return (
    <div className="container max-w-3xl py-10 md:py-14">
      <header className="mb-8 text-center">
        <Badge variant="secondary" className="mb-3 gap-1">
          <Layers className="h-3.5 w-3.5" /> Drill Cepat
        </Badge>
        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
          Flashcard — Hafalin Pola Jebakannya
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Ujian ini lebih banyak nge-test <strong>nalar nolak jawaban yang keliatan
          masuk akal</strong> daripada hafalan definisi. Kartu di sini latih refleks
          itu: depan jebakannya, belakang kenapa harus ditolak.
        </p>
      </header>

      <DrillBoard />
    </div>
  );
}
