"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress";

export function ReadToggle({ num }: { num: string }) {
  const { tasks, toggleRead } = useProgress();
  const read = !!tasks[num]?.read;

  return (
    <Button
      variant={read ? "secondary" : "outline"}
      size="sm"
      className="mt-5 gap-2"
      onClick={() => toggleRead(num)}
      aria-pressed={read}
    >
      {read ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-success" /> Udah dibaca ✓
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" /> Tandai udah dibaca
        </>
      )}
    </Button>
  );
}
