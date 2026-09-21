import { curriculum } from "@/lib/curriculum";
import { tongkrongan } from "@/lib/tongkrongan";

export type DrillKind = "trap" | "istilah";

export interface DrillCard {
  /** id stabil buat nyimpen status "udah kuat" di localStorage. */
  id: string;
  kind: DrillKind;
  domainNum: number;
  num: string;
  taskTitle: string;
  taskSlug: string;
  domainSlug: string;
  /** bagian depan kartu — yang harus lu inget jawabannya. */
  front: string;
  /** bagian belakang kartu — jawaban/pembahasannya. */
  back: string;
}

/** Satu sumber kebenaran buat judul & slug task, dari curriculum.json (kecil). */
function taskIndex() {
  const map = new Map<string, { title: string; domainSlug: string; taskSlug: string }>();
  for (const d of curriculum.domains) {
    for (const t of d.tasks) {
      map.set(t.num, {
        title: t.title,
        domainSlug: d.slug,
        taskSlug: t.url.split("/").pop() ?? "",
      });
    }
  }
  return map;
}

/** Kartu istilah: depan = istilah Inggris, belakang = arti santai. */
export function getIstilahCards(): DrillCard[] {
  const idx = taskIndex();
  const cards: DrillCard[] = [];
  for (const [num, tg] of Object.entries(tongkrongan)) {
    const meta = idx.get(num);
    if (!meta) continue;
    tg.istilah.forEach((it, i) => {
      cards.push({
        id: `istilah-${num}-${i}`,
        kind: "istilah",
        domainNum: Number(num.split(".")[0]),
        num,
        taskTitle: meta.title,
        taskSlug: meta.taskSlug,
        domainSlug: meta.domainSlug,
        front: it.term,
        back: it.arti,
      });
    });
  }
  return cards;
}

/* ---------------- kartu jebakan (di-generate ke JSON waktu build) ---------------- */

export interface TrapEntry {
  num: string;
  title: string;
  domainSlug: string;
  taskSlug: string;
  domainNum: number;
  traps: { trap: string; why: string }[];
}

/** Ubah content/traps.json jadi kartu drill (fetch runtime, biar bundle tetap kecil). */
export function trapCardsFrom(entries: TrapEntry[]): DrillCard[] {
  const cards: DrillCard[] = [];
  for (const t of entries) {
    t.traps.forEach((trap, i) => {
      cards.push({
        id: `trap-${t.num}-${i}`,
        kind: "trap",
        domainNum: t.domainNum,
        num: t.num,
        taskTitle: t.title,
        taskSlug: t.taskSlug,
        domainSlug: t.domainSlug,
        front: trap.trap,
        back: trap.why || "Pola ini harus ditolak di ujian.",
      });
    });
  }
  return cards;
}
