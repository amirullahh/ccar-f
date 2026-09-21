import React from "react";
import { cn } from "@/lib/utils";

/**
 * Inline markdown-ish renderer for scraped content:
 * **bold**, `code`, [text](url)
 */
const TOKEN_RE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

export function InlineText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(TOKEN_RE).filter(Boolean);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[0.85em] font-semibold text-primary dark:bg-primary/20">
              {part.slice(1, -1)}
            </code>
          );
        }
        const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (link) {
          return (
            <a
              key={i}
              href={link[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-4"
            >
              {link[1]}
            </a>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}

/** Renders a JSON-ish code block with minimal highlighting (strings & keys). */
export function CodeBlock({ lang, text }: { lang: string; text: string }) {
  return (
    <div className="my-4 overflow-hidden rounded-xl border bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
          {lang || "code"}
        </span>
        <span className="flex gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <i className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <i className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        </span>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-zinc-100">
        <code>{text}</code>
      </pre>
    </div>
  );
}

export function Blocks({ blocks }: { blocks: import("@/lib/data").Block[] }) {
  return (
    <div className="prose-lesson">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h3":
            return (
              <h3 key={i} className="mb-2 mt-8 text-xl font-bold tracking-tight">
                {b.text}
              </h3>
            );
          case "p":
            return <p key={i} className="my-3">{<InlineText text={b.text} />}</p>;
          case "ul":
            return (
              <ul key={i} className="my-3 list-disc space-y-1.5 pl-5">
                {b.items.map((it, j) => (
                  <li key={j}>
                    <InlineText text={it.text} />
                    {it.sub.length > 0 && (
                      <ul className="mt-1.5 list-[circle] space-y-1 pl-5 text-[0.95em]">
                        {it.sub.map((s, k) => (
                          <li key={k}>
                            <InlineText text={s} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="my-3 list-decimal space-y-1.5 pl-5">
                {b.items.map((it, j) => (
                  <li key={j} className="pl-1">
                    <InlineText text={it.text} />
                    {it.sub.length > 0 && (
                      <ul className="mt-1.5 list-[circle] space-y-1 pl-5 text-[0.95em]">
                        {it.sub.map((s, k) => (
                          <li key={k}>
                            <InlineText text={s} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            );
          case "callout":
            return (
              <div
                key={i}
                className={cn(
                  "my-5 rounded-xl border-l-4 border-primary bg-primary/5 p-4",
                  "shadow-[0_1px_0_0_rgba(0,0,0,0.02)]"
                )}
              >
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
                  💡 {b.label}
                </div>
                <InlineText text={b.text} className="text-sm leading-6" />
              </div>
            );
          case "code":
            return <CodeBlock key={i} lang={b.lang} text={b.text} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
