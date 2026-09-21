"use client";

import { useState } from "react";
import { Check, ChevronRight, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InlineText } from "@/components/lesson-blocks";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import type { Quiz } from "@/lib/data";

/**
 * Concept Check: interactive single-choice quiz with per-option feedback.
 * Self-contained styling; reusable for lesson pages and the exam simulator.
 */
export function QuizCard({
  num,
  taskTitle,
  domainTitle,
  question,
  options,
  correct,
  explain,
  onAnswered,
  trackProgress = true,
  compact = false,
}: {
  num?: string;
  taskTitle?: string;
  domainTitle?: string;
  question: string;
  options: { letter: string; text: string }[];
  correct: string | null;
  explain: Record<string, string>;
  onAnswered?: (correct: boolean, chosen: string) => void;
  trackProgress?: boolean;
  compact?: boolean;
}) {
  const { recordQuiz } = useProgress();
  const [chosen, setChosen] = useState<string | null>(null);
  const [showWhy, setShowWhy] = useState(false);

  const answered = chosen !== null;
  const isCorrect = answered && chosen === correct;

  function pick(letter: string) {
    if (answered) return;
    setChosen(letter);
    const ok = letter === correct;
    if (trackProgress && num) recordQuiz(num, ok);
    onAnswered?.(ok, letter);
  }

  function retry() {
    setChosen(null);
    setShowWhy(false);
  }

  return (
    <section
      aria-label="Concept check"
      className={cn(
        "overflow-hidden rounded-2xl border-2 border-primary/30 bg-card",
        compact ? "" : "shadow-lg shadow-primary/5"
      )}
    >
      <div className="border-b border-primary/15 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>✅ Concept Check</Badge>
          {num && <Badge variant="outline">Task {num}</Badge>}
          {domainTitle && <Badge variant="secondary">{domainTitle}</Badge>}
        </div>
        {taskTitle && (
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {taskTitle}
          </p>
        )}
      </div>

      <div className={cn("px-6", compact ? "py-4" : "py-5")}>
        <p className="text-[15px] font-medium leading-7">{question}</p>

        <div className="mt-4 space-y-2.5">
          {options.map((opt) => {
            const picked = chosen === opt.letter;
            const isRight = opt.letter === correct;
            const showRight = answered && isRight;
            const showWrong = picked && !isRight;
            return (
              <button
                key={opt.letter}
                onClick={() => pick(opt.letter)}
                disabled={answered}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm leading-6 transition-all",
                  !answered && "hover:border-primary/50 hover:bg-primary/5 cursor-pointer",
                  showRight && "border-success bg-success/10",
                  showWrong && "border-destructive bg-destructive/10",
                  answered && !showRight && !showWrong && "opacity-55"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                    showRight
                      ? "border-success bg-success text-success-foreground"
                      : showWrong
                        ? "border-destructive bg-destructive text-destructive-foreground"
                        : "border-border text-muted-foreground group-hover:border-primary group-hover:text-primary"
                  )}
                >
                  {showRight ? <Check className="h-3.5 w-3.5" /> : showWrong ? <X className="h-3.5 w-3.5" /> : opt.letter}
                </span>
                <span>
                  <InlineText text={opt.text} />
                </span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-5 animate-fade-up space-y-3">
            <div
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4",
                isCorrect ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"
              )}
            >
              <span className="text-xl">{isCorrect ? "🎉" : "😭"}</span>
              <div className="text-sm leading-6">
                <p className="font-bold">
                  {isCorrect
                    ? "Bener, gas lanjut!"
                    : `Kurang tepat — jawabannya ${correct}.`}
                </p>
                {correct && explain[chosen ?? ""] && (
                  <p className="mt-1 text-muted-foreground">
                    <span className="font-semibold text-foreground">Pilihan lu ({chosen}):</span>{" "}
                    <InlineText text={explain[chosen!]} />
                  </p>
                )}
              </div>
            </div>

            {correct && (
              <div>
                <button
                  onClick={() => setShowWhy((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  <Lightbulb className="h-4 w-4" />
                  {showWhy ? "Sembunyikan pembahasan" : "Kenapa opsi lain salah?"}
                  <ChevronRight className={cn("h-4 w-4 transition-transform", showWhy && "rotate-90")} />
                </button>
                {showWhy && (
                  <div className="mt-2 space-y-2 animate-fade-up">
                    {options
                      .filter((o) => o.letter !== correct)
                      .map((o) => (
                        <div
                          key={o.letter}
                          className="rounded-lg border border-border/70 bg-muted/40 p-3 text-sm leading-6"
                        >
                          <span className="font-bold text-destructive">({o.letter}) salah:</span>{" "}
                          <InlineText text={explain[o.letter] ?? "—"} />
                        </div>
                      ))}
                    <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm leading-6">
                      <span className="font-bold text-success">({correct}) benar:</span>{" "}
                      <InlineText text={explain[correct] ?? "—"} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={retry}>
                🔄 Coba lagi
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
