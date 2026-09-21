"use client";

import { useState } from "react";
import { ChevronDown, Clock, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InlineText } from "@/components/lesson-blocks";
import type { BuildStep } from "@/lib/data";

export function BuildExercise({
  title,
  duration,
  learn,
  steps,
}: {
  title: string;
  duration: string;
  learn: string[];
  steps: BuildStep[];
}) {
  const [open, setOpen] = useState<number[]>([0]);

  function toggle(i: number) {
    setOpen((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  }

  return (
    <Card className="border-primary/25">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              🔨
            </span>
            Build Exercise {title && <span className="text-muted-foreground">— {title}</span>}
          </CardTitle>
          {duration && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" /> {duration}
            </Badge>
          )}
        </div>
        {learn.length > 0 && (
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Target className="h-3.5 w-3.5" /> Yang bakal lu pelajari
            </p>
            <ul className="space-y-1 text-sm leading-6 text-muted-foreground">
              {learn.map((l, i) => (
                <li key={i}>• {l}</li>
              ))}
            </ul>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border rounded-xl border">
          {steps.map((step, i) => {
            const isOpen = open.includes(i);
            return (
              <div key={i}>
                <button
                  onClick={() => toggle(i)}
                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-accent/50"
                  aria-expanded={isOpen}
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-semibold leading-6">
                    <InlineText text={step.text} />
                  </span>
                  <ChevronDown
                    className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="animate-fade-up space-y-2 px-4 pb-4 pl-[52px]">
                    {step.why && (
                      <p className="text-sm leading-6">
                        <span className="font-bold text-primary">Kenapa:</span>{" "}
                        <span className="text-muted-foreground">
                          <InlineText text={step.why} />
                        </span>
                      </p>
                    )}
                    {step.see && (
                      <p className="text-sm leading-6">
                        <span className="font-bold text-success">Lu harusnya liat:</span>{" "}
                        <span className="text-muted-foreground">
                          <InlineText text={step.see} />
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
