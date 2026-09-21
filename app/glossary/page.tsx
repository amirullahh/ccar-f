import type { Metadata } from "next";
import { BookMarked } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlossaryBrowser } from "@/components/glossary-browser";

export const metadata: Metadata = {
  title: "Glossary Istilah",
  description:
    "Kamus istilah Claude Certified Architect (Foundations): istilah asli ujian dalam Bahasa Inggris, dijelaskan pakai Bahasa Indonesia santai.",
};

export default function GlossaryPage() {
  return (
    <div className="container max-w-5xl py-10 md:py-14">
      <header className="mb-8 text-center">
        <Badge variant="secondary" className="mb-3 gap-1">
          <BookMarked className="h-3.5 w-3.5" /> Kamus Istilah
        </Badge>
        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
          Glossary — Istilah Ujian, Dijelasin Santai
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Ujiannya pakai Bahasa Inggris, jadi istilah aslinya wajib lu kenal. Tapi
          artinya nggak perlu nebak-nebak — semua di sini dijelasin pakai bahasa
          tongkrongan.
        </p>
      </header>

      <GlossaryBrowser />
    </div>
  );
}
