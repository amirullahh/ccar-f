"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookMarked,
  BookOpen,
  Compass,
  GraduationCap,
  Home,
  Layers,
  Moon,
  Search,
  Sun,
  Timer,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "@/components/search-dialog";
import { cn } from "@/lib/utils";

/** Navigasi utama — dijaga maksimal 5 item biar nggak overload. */
const NAV = [
  { href: "/learn", label: "Belajar", icon: BookOpen },
  { href: "/drill", label: "Drill", icon: Layers },
  { href: "/exam-sim", label: "Exam Sim", icon: Timer },
  { href: "/cheatsheet", label: "Cheat Sheet", icon: Zap },
  { href: "/glossary", label: "Glossary", icon: BookMarked },
];

const EXTRA = [
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/diagnostic", label: "Diagnostic", icon: Compass },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [dark, setDark] = useState<boolean | null>(null);

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("ccar-theme", isDark ? "dark" : "light");
    } catch {}
    setDark(isDark);
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="hidden sm:block">
            Claude Exam <span className="text-primary">Guide</span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="ml-2 hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {EXTRA.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Button
                key={item.href}
                variant={active ? "secondary" : "ghost"}
                size="icon"
                asChild
                title={item.label}
              >
                <Link href={item.href} aria-label={item.label}>
                  <item.icon className="h-4 w-4" />
                </Link>
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Cari konsep…</span>
            <kbd className="hidden rounded border bg-muted px-1.5 font-mono text-[10px] md:inline">
              /
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Ganti tema terang/gelap"
            onClick={toggleTheme}
            suppressHydrationWarning
          >
            {dark === null ? (
              <span className="block h-4 w-4" />
            ) : dark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* navigasi mobile — bisa di-scroll horizontal biar nggak berdesakan */}
      <nav
        aria-label="Navigasi mobile"
        className="flex items-center gap-1 overflow-x-auto border-t px-3 py-1.5 lg:hidden"
      >
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold",
            pathname === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground"
          )}
        >
          <Home className="h-3.5 w-3.5" /> Home
        </Link>
        {[...NAV, ...EXTRA].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname.startsWith(item.href) ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold",
              pathname.startsWith(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-3.5 w-3.5" /> {item.label}
          </Link>
        ))}
      </nav>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
