"use client";

import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Blocks } from "@/components/lesson-blocks";
import type { Block } from "@/lib/data";

/**
 * Teks asli (English) dari study guide — sumber kebenaran istilah ujian.
 * Dilipat secara default karena halaman ini dibaca anak non-IT, tapi tetap
 * gampang dibuka kalau mau ngecek kalimat aslinya.
 */
export function EnglishOriginal({ blocks }: { blocks: Block[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="english-original"
          className="flex w-full items-start justify-between gap-3 text-left"
        >
          <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            Teks Asli
            <Badge variant="outline">🇬🇧 English</Badge>
          </CardTitle>
          <span className="mt-1 flex shrink-0 items-center gap-1.5 text-xs font-semibold text-primary">
            {open ? "Sembunyikan" : "Lihat teks asli"}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>
        <p className="text-sm text-muted-foreground">
          Kalimat persis dari study guide. Dipakai buat ngecek istilah ujian yang
          sering muncul apa adanya.
        </p>
      </CardHeader>
      {open && (
        <CardContent id="english-original" className="pt-2 animate-fade-up">
          <Blocks blocks={blocks} />
        </CardContent>
      )}
    </Card>
  );
}
