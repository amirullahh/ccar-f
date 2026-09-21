import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 font-display font-extrabold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
              <GraduationCap className="h-4 w-4" />
            </span>
            Claude Exam Guide ID
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Panduan belajar CCAR-F (Claude Certified Architect — Foundations) dengan bahasa
            anak tongkrongan. Dibuat untuk mahasiswa non-IT yang mau lulus tanpa pusing.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="mb-2 font-bold">Belajar</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li><Link className="hover:text-primary" href="/learn">Semua Domain</Link></li>
              <li><Link className="hover:text-primary" href="/drill">Drill Flashcard</Link></li>
              <li><Link className="hover:text-primary" href="/exam-sim">Exam Simulator</Link></li>
              <li><Link className="hover:text-primary" href="/cheatsheet">Cheat Sheet</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-bold">Alat</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li><Link className="hover:text-primary" href="/glossary">Glossary Istilah</Link></li>
              <li><Link className="hover:text-primary" href="/progress">Progress Belajar</Link></li>
              <li><Link className="hover:text-primary" href="/diagnostic">Diagnostic Test</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-bold">Sumber Resmi</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li><a className="hover:text-primary" href="https://platform.claude.com/docs/en/agent-sdk/overview" target="_blank" rel="noopener noreferrer">Agent SDK Docs</a></li>
              <li><a className="hover:text-primary" href="https://docs.anthropic.com/en/api/messages" target="_blank" rel="noopener noreferrer">Messages API</a></li>
              <li><a className="hover:text-primary" href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">MCP Spec</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t py-4">
        <p className="container text-xs leading-6 text-muted-foreground">
          Materi study guide bersumber dari claudecertificationguide.com (CCAR-F, Exam Guide v1.0).
          Situs ini bukan produk resmi Anthropic. trademark Claude dan Anthropic milik Anthropic, PBC.
        </p>
      </div>
    </footer>
  );
}
