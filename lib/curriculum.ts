/**
 * curriculum.ts
 * Data kurikulum (5 domain + 30 task statement) — file kecil (~8 KB).
 * Dipisah dari lib/data.ts yang ikut narik tasks.json (~490 KB) supaya halaman
 * client nggak ikut nge-bundle seluruh materi.
 */
import curriculumJson from "@/content/curriculum.json";

export interface Domain {
  num: number;
  slug: string;
  weight: number;
  title: string;
  description: string;
  tasks: { num: string; title: string; url: string }[];
}

export interface ExamInfo {
  title: string;
  code: string;
  questions: number;
  minutes: number;
  price: string;
  passMark: string;
  validMonths: number;
}

export const curriculum = curriculumJson as unknown as {
  generatedAt: string;
  exam: ExamInfo;
  domains: Domain[];
};

export const exam = curriculum.exam;

export function getDomains(): Domain[] {
  return curriculum.domains;
}

export function getDomain(slug: string): Domain | undefined {
  return curriculum.domains.find((d) => d.slug === slug);
}

export function getTaskMeta(num: string): { num: string; title: string; url: string } | undefined {
  for (const d of curriculum.domains) {
    const t = d.tasks.find((x) => x.num === num);
    if (t) return t;
  }
  return undefined;
}

export function taskSlugOf(num: string): { domainSlug: string; taskSlug: string } | undefined {
  const domainNum = num.split(".")[0];
  const d = curriculum.domains.find((x) => String(x.num) === domainNum);
  const t = d?.tasks.find((x) => x.num === num);
  if (!d || !t) return undefined;
  // URL kurikulum berakhir dengan slug task, mis. .../1-1-agentic-loops
  return { domainSlug: d.slug, taskSlug: t.url.split("/").pop() ?? "" };
}

export const domainMeta: Record<
  number,
  { short: string; color: string; emoji: string; blurb: string }
> = {
  1: {
    short: "Agentic Architecture",
    color: "from-violet-500 to-fuchsia-500",
    emoji: "🤖",
    blurb: "Loop, orchestrasi multi-agent, SDK hooks",
  },
  2: {
    short: "Tool Design & MCP",
    color: "from-blue-500 to-cyan-500",
    emoji: "🛠️",
    blurb: "Tool schema, error responses, MCP server",
  },
  3: {
    short: "Claude Code",
    color: "from-amber-500 to-orange-500",
    emoji: "⚙️",
    blurb: "CLAUDE.md, skills, plan mode, CI/CD",
  },
  4: {
    short: "Prompt Engineering",
    color: "from-emerald-500 to-teal-500",
    emoji: "✍️",
    blurb: "System prompt, few-shot, structured output",
  },
  5: {
    short: "Context Management",
    color: "from-rose-500 to-pink-500",
    emoji: "🧠",
    blurb: "Context window, eskalasi, provenance",
  },
};
