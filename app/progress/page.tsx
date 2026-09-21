import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressDashboard } from "@/components/progress-dashboard";

export const metadata: Metadata = {
  title: "Progress Belajar",
  description:
    "Dashboard progres belajar CCAR-F: modul yang sudah dibaca, kuis yang sudah benar, kartu drill yang dikuasai, dan riwayat skor ujian.",
};

export default function ProgressPage() {
  return (
    <div className="container max-w-4xl py-10 md:py-14">
      <header className="mb-8 text-center">
        <Badge variant="secondary" className="mb-3 gap-1">
          <BarChart3 className="h-3.5 w-3.5" /> Dashboard
        </Badge>
        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
          Progres Belajar Lu
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Semua catatan di halaman ini disimpan di browser lu sendiri. Fokusnya satu:
          kelihatan jelas bagian mana yang masih merah, biar belajar lu nggak asal ngegas.
        </p>
      </header>

      <ProgressDashboard />
    </div>
  );
}
