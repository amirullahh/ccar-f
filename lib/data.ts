import tasksJson from "@/content/tasks.json";
import questionsJson from "@/content/questions.json";

// Data kurikulum tinggal di lib/curriculum.ts (file kecil) supaya halaman client
// bisa ambil daftar domain tanpa ikut nge-bundle tasks.json (~490 KB).
export {
  curriculum,
  exam,
  getDomains,
  getDomain,
  getTaskMeta,
  taskSlugOf,
  domainMeta,
  type Domain,
  type ExamInfo,
} from "./curriculum";

export type Inline = string;

export type Block =
  | { type: "p"; text: Inline }
  | { type: "h3"; text: Inline }
  | { type: "ul"; items: { text: Inline; sub: Inline[] }[] }
  | { type: "ol"; items: { text: Inline; sub: Inline[] }[] }
  | { type: "callout"; label: Inline; text: Inline }
  | { type: "code"; lang: string; text: Inline };

export interface ExamTrap {
  trap: string;
  why: string;
}

export interface QuizOption {
  letter: string;
  text: string;
}

export interface Quiz {
  question: string;
  options: QuizOption[];
  correct: string | null;
  explain: Record<string, string>;
}

export interface BuildStep {
  text: string;
  why: string;
  see: string;
}

export interface Task {
  domainSlug: string;
  taskSlug: string;
  num: string;
  title: string;
  blocks: Block[];
  traps: ExamTrap[];
  scenario: Quiz;
  build: { title: string; duration: string; learn: string[]; steps: BuildStep[] };
  sources: { title: string; url: string; by: string }[];
}

export interface Question extends Quiz {
  id: string;
  domainNum: number;
  domainTitle: string;
  domainSlug: string;
  taskSlug: string;
  taskTitle: string;
}

export const tasks = tasksJson as unknown as Task[];
export const questions = questionsJson as unknown as Question[];

export function getTasksForDomain(slug: string): Task[] {
  return tasks.filter((t) => t.domainSlug === slug);
}

export function getTask(domainSlug: string, taskSlug: string): Task | undefined {
  return tasks.find((t) => t.domainSlug === domainSlug && t.taskSlug === taskSlug);
}

export function getTaskNeighbors(domainSlug: string, taskSlug: string) {
  const idx = tasks.findIndex(
    (t) => t.domainSlug === domainSlug && t.taskSlug === taskSlug
  );
  return {
    prev: idx > 0 ? tasks[idx - 1] : undefined,
    next: idx >= 0 && idx < tasks.length - 1 ? tasks[idx + 1] : undefined,
  };
}

export function getTasksByNum(num: string): Task | undefined {
  return tasks.find((t) => t.num === num);
}
