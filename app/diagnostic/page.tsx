import type { Metadata } from "next";
import { Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DiagnosticRunner } from "@/components/diagnostic-runner";

export const metadata: Metadata = {
  title: "Diagnostic Test",
  description:
    "Tes awal 15 soal CCAR-F buat tau domain mana yang paling perlu dikejar duluan, biar waktu belajar nggak kepakai di bagian yang sudah dikuasai.",
};

export default function DiagnosticPage() {
  return (
    <div className="container max-w-3xl py-10 md:py-14">
      <header className="mb-8 text-center">
        <Badge variant="secondary" className="mb-3 gap-1">
          <Compass className="h-3.5 w-3.5" /> Diagnostic
        </Badge>
        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
          Mulai dari Mana?
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Kalau lu masih bingung harus ngegas dari domain mana, tes dulu di sini.
          Hasilnya langsung ngasih tau titik lemah lu.
        </p>
      </header>

      <DiagnosticRunner />
    </div>
  );
}
