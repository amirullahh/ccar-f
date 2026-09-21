/**
 * build-content.mjs
 * Parse raw scraped .md files (27 tasks + 5 domain overviews) into structured JSON.
 * Cleans site chrome, splits sections, joins with curated answer key.
 *
 * Usage: node scripts/build-content.mjs [--dump-scenarios]
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { ANSWER_KEY } from "./answer-key.mjs";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "content");
mkdirSync(OUT_DIR, { recursive: true });

const DUMP = process.argv.includes("--dump-scenarios");

// ---------------- helpers ----------------
const clean = (s) =>
  s.replace(/\r/g, "").replace(/\u00a0/g, " ").replace(/[ \t]+$/gm, "");

const CALLOUT_LABELS = new Set([
  "Key Concept",
  "Common Exam Distractor",
  "Current state",
  "Beyond the guide",
]);
const isCalloutLabel = (t) =>
  CALLOUT_LABELS.has(t) ||
  /^Current state[:—-]/.test(t) ||
  /^Beyond the guide[:—-]/.test(t);

/** Parse markdown-ish scraped text into structured blocks. */
function parseBlocks(md) {
  const lines = md.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const t = raw.trim();
    if (!t) { i++; continue; }

    // code fence (strip scrape junk like "jsonCopy" before fence)
    if (/^[a-z]*Copy$/i.test(t) && (lines[i + 1] || "").trim().startsWith("```")) { i++; continue; }
    if (t.startsWith("```")) {
      const lang = t.slice(3).trim();
      i++;
      const code = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) { code.push(lines[i]); i++; }
      i++; // skip closing fence
      blocks.push({ type: "code", lang, text: code.join("\n") });
      continue;
    }

    if (/^#{3,4}\s/.test(t)) {
      blocks.push({ type: "h3", text: t.replace(/^#{3,4}\s*/, "") });
      i++; continue;
    }

    if (isCalloutLabel(t)) {
      // "Current state: beyond the two exam values" carries a sub-heading inline;
      // split it into a clean label + opening sentence.
      const label = t;
      const body = [];
      i++;
      // The callout ends at the first structural boundary. Without these breaks a
      // single callout swallows the rest of the section (headings, paragraphs,
      // other callouts) and renders raw markdown onto the page.
      while (i < lines.length) {
        const bt = lines[i].trim();
        if (!bt) break;
        if (bt.startsWith("```")) break;
        if (/^#{1,6}\s/.test(bt)) break;
        if (isCalloutLabel(bt)) break;
        if (/^\d+\.\s/.test(bt) || /^[-*]\s/.test(bt)) break;
        body.push(bt);
        i++;
      }
      if (body.length) blocks.push({ type: "callout", label, text: body.join(" ") });
      continue;
    }

    // lists
    const liNum = t.match(/^(\d+)\.\s+(.*)$/);
    const liBullet = t.match(/^[-*]\s+(.*)$/);
    if (liNum || liBullet) {
      const ordered = !!liNum;
      const items = [];
      while (i < lines.length) {
        const lt = lines[i].trim();
        if (!lt) {
          // peek ahead: allow blank line inside list if next content is still a list item
          let j = i + 1;
          while (j < lines.length && !lines[j].trim()) j++;
          const nt = (lines[j] || "").trim();
          if (j < lines.length && (/^\d+\.\s/.test(nt) || /^[-*]\s/.test(nt))) { i = j; continue; }
          break;
        }
        if (/^#{3,4}\s/.test(lt) || isCalloutLabel(lt) || lt.startsWith("```")) break;
        const nm = lt.match(/^(\d+)\.\s+(.*)$/);
        const bm = lt.match(/^[-*]\s+(.*)$/);
        const indented = /^\s{4,}[-*]\s/.test(lines[i]);
        if (nm) items.push({ text: nm[2], sub: [] });
        else if (bm && indented && items.length) items[items.length - 1].sub.push(bm[1]);
        else if (bm) items.push({ text: bm[1], sub: [] });
        else if (items.length) items[items.length - 1].text += " " + lt; // wrapped continuation
        else break;
        i++;
      }
      if (items.length) blocks.push({ type: ordered ? "ol" : "ul", items });
      continue;
    }

    // paragraph: collect until blank / heading / callout / list / fence
    const para = [t];
    i++;
    while (i < lines.length) {
      const nt = lines[i].trim();
      if (!nt || /^#{3,4}\s/.test(nt) || isCalloutLabel(nt) || nt.startsWith("```")) break;
      if (/^\d+\.\s/.test(nt) || /^[-*]\s/.test(nt)) break;
      para.push(nt); i++;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}

// ---------------- section splitter ----------------
function splitSections(body) {
  const sections = [];
  const re = /^## (.+)$/gm;
  let m;
  while ((m = re.exec(body))) sections.push({ name: m[1].trim(), start: m.index, len: m[0].length });
  return (name) => {
    const idx = sections.findIndex((s) => s.name.toLowerCase() === name.toLowerCase());
    if (idx === -1) return "";
    const end = idx + 1 < sections.length ? sections[idx + 1].start : body.length;
    return body.slice(sections[idx].start + sections[idx].len, end);
  };
}

// ---------------- task file ----------------
function parseTaskFile(raw, domainSlug, taskSlug) {
  const text = clean(raw);
  const marker = text.match(/Domain \d+Task \d+\.\d+/);
  let body = marker ? text.slice(text.indexOf(marker[0]) + marker[0].length) : text;
  body = body
    .split("\n")
    .filter((l) => !/^\s*(Mark Complete|Learn this interactively\|)/.test(l))
    .join("\n");

  const titleM = body.match(/^#\s+(.+)$/m);
  const title = titleM ? titleM[1].trim() : taskSlug;
  const numM = taskSlug.match(/^(\d+)-(\d+)/);
  const num = numM ? `${numM[1]}.${numM[2]}` : taskSlug;

  const get = splitSections(body);

  // --- What You Need to Know ---
  const blocks = parseBlocks(get("What You Need to Know"));

  // --- Exam Traps ---
  const traps = [];
  {
    const lines = get("Exam Traps").split("\n").map((l) => l.trim()).filter(Boolean);
    let cur = null;
    for (const l of lines) {
      if (l === "Exam Trap") { if (cur) traps.push(cur); cur = { trap: "", why: "" }; continue; }
      if (!cur) continue;
      if (!cur.trap) cur.trap = l;
      else cur.why += (cur.why ? " " : "") + l;
    }
    if (cur) traps.push(cur);
  }

  // --- Practice Scenario ---
  const scenario = { question: "", options: [] };
  {
    const lines = get("Practice Scenario").split("\n").map((l) => l.trim()).filter(Boolean);
    const q = [];
    let i = 0;
    while (i < lines.length && !/^Option [A-F]/.test(lines[i])) { q.push(lines[i]); i++; }
    scenario.question = q.join(" ").replace(/\s*Check Answer\s*$/i, "");
    while (i < lines.length) {
      const om = lines[i].match(/^Option ([A-F])\s*(.*)$/);
      if (om) {
        const opt = { letter: om[1], text: om[2] };
        i++;
        while (i < lines.length && !/^Option [A-F]/.test(lines[i]) && !/^Check Answer$/i.test(lines[i])) {
          opt.text += " " + lines[i]; i++;
        }
        scenario.options.push(opt);
      } else i++;
    }
  }

  // --- Build Exercise ---
  const build = { title: "", duration: "", learn: [], steps: [] };
  {
    const lines = get("Build Exercise").split("\n").map((l) => l.replace(/\s+$/, "")).filter((l) => l.trim());
    let i = 0;
    while (i < lines.length && !/^####\s/.test(lines[i].trim())) i++;
    if (i < lines.length) build.title = lines[i].trim().replace(/^####\s*/, "");
    i++;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (/^Difficulty$/i.test(t)) {
        i++;
        if (i < lines.length) build.duration = lines[i].trim();
        i++; continue;
      }
      if (/^What you'?ll learn$/i.test(t)) {
        i++;
        while (i < lines.length && !/^\s*\d+\.\s/.test(lines[i])) {
          const lt = lines[i].trim();
          if (/^[-*]\s/.test(lt)) build.learn.push(lt.replace(/^[-*]\s*/, ""));
          i++;
        }
        continue;
      }
      const sm = t.match(/^(\d+)\.\s*(.*)$/);
      if (sm) {
        const step = { text: sm[2], why: "", see: "" };
        i++;
        while (i < lines.length) {
          const lt = lines[i].trim();
          if (/^\d+\.\s/.test(lt)) break;
          if (/^Why:/i.test(lt)) {
            step.why = lt.replace(/^Why:\s*/i, ""); i++;
            while (i < lines.length && !/^(You should see:|Stuck\?|Why:|\d+\.\s)/i.test(lines[i].trim())) { step.why += " " + lines[i].trim(); i++; }
            continue;
          }
          if (/^You should see:/i.test(lt)) {
            step.see = lt.replace(/^You should see:\s*/i, ""); i++;
            while (i < lines.length && !/^(Stuck\?|Why:|You should see:|\d+\.\s)/i.test(lines[i].trim())) { step.see += " " + lines[i].trim(); i++; }
            continue;
          }
          if (/^Stuck\?/i.test(lt)) { i++; continue; }
          step.text += " " + lt; i++;
        }
        build.steps.push(step);
        continue;
      }
      i++;
    }
  }

  // --- Sources ---
  const sources = [];
  {
    const lines = get("Sources").split("\n").map((l) => l.trim()).filter(Boolean);
    for (const l of lines) {
      const lm = l.match(/^[-*]\s*\[([^\]]+)\]\(([^)]+)\)\s*[—-]?\s*(.*)$/);
      if (lm) sources.push({ title: lm[1], url: lm[2], by: lm[3].trim() });
      else if (sources.length) break; // footer chrome begins
    }
  }

  const key = ANSWER_KEY[num];
  const question = {
    ...scenario,
    correct: key ? key.correct : null,
    explain: key ? key.explain : {},
  };

  return { domainSlug, taskSlug, num, title, blocks, traps, scenario: question, build, sources };
}

// ---------------- domain overview file ----------------
function parseDomainFile(raw, domainSlug) {
  const text = clean(raw);
  const num = parseInt(domainSlug.match(/^(\d)/)?.[1] || "0", 10);
  const head = text.match(new RegExp(`Domain ${num}(\\d{2})%`));
  const weight = head ? parseInt(head[1], 10) : 0;
  const titleM = text.match(/^#\s+(.+)$/m);
  const title = titleM ? titleM[1].trim() : domainSlug;
  const descM = text.match(/^#\s+.+\n+([^\n#][^\n]*)/m);
  const description = descM ? descM[1].trim() : "";

  const tasks = [];
  const re = /\[\s*(\d)\.(\d+)\s*([^\]]*?)\s*\]\(([^)]+)\)/g;
  let tm;
  while ((tm = re.exec(text))) {
    tasks.push({ num: `${tm[1]}.${tm[2]}`, title: tm[3].trim(), url: tm[4] });
  }
  return { num, slug: domainSlug, weight, title, description, tasks };
}

// ---------------- main ----------------
const files = readdirSync(ROOT).filter((f) => f.endsWith(".md"));

const domainFiles = files.filter((f) => /^\d-[a-z-]+\.md$/.test(f));
const taskFiles = files.filter((f) => /^\d-[a-z-]+_\d+-\d+.*\.md$/.test(f));

const domains = [];
for (const f of domainFiles) {
  const slug = f.replace(/\.md$/, "");
  try { domains.push(parseDomainFile(readFileSync(join(ROOT, f), "utf8"), slug)); }
  catch (e) { console.warn(`[warn] failed parsing domain ${f}: ${e.message}`); }
}
domains.sort((a, b) => a.num - b.num);

const tasks = [];
for (const f of taskFiles.sort()) {
  const [domainSlug, taskSlug] = f.replace(/\.md$/, "").split("_");
  try { tasks.push(parseTaskFile(readFileSync(join(ROOT, f), "utf8"), domainSlug, taskSlug)); }
  catch (e) { console.warn(`[warn] failed parsing task ${f}: ${e.message}`); }
}

// fallback weights if overview parse failed
const FALLBACK_WEIGHTS = { 1: 27, 2: 18, 3: 20, 4: 20, 5: 15 };
for (const d of domains) if (!d.weight) d.weight = FALLBACK_WEIGHTS[d.num] || 0;

// curriculum.json
const curriculum = {
  generatedAt: new Date().toISOString(),
  exam: {
    title: "Claude Certified Architect (Foundations)",
    code: "CCAR-F",
    questions: 60,
    minutes: 120,
    price: "$125",
    passMark: "720/1000",
    validMonths: 12,
  },
  domains: domains.map((d) => ({
    num: d.num,
    slug: d.slug,
    weight: d.weight,
    title: d.title,
    description: d.description,
    tasks: d.tasks,
  })),
};
writeFileSync(join(OUT_DIR, "curriculum.json"), JSON.stringify(curriculum, null, 2));

// tasks.json
writeFileSync(join(OUT_DIR, "tasks.json"), JSON.stringify(tasks, null, 2));

// questions.json (for exam simulator)
const questions = tasks
  .filter((t) => t.scenario.question && t.scenario.options.length)
  .map((t) => {
    const d = domains.find((x) => x.num === parseInt(t.num, 10));
    return {
      id: t.num,
      domainNum: d?.num,
      domainTitle: d?.title,
      domainSlug: t.domainSlug,
      taskSlug: t.taskSlug,
      taskTitle: t.title,
      question: t.scenario.question,
      options: t.scenario.options,
      correct: t.scenario.correct,
      explain: t.scenario.explain,
    };
  });
writeFileSync(join(OUT_DIR, "questions.json"), JSON.stringify(questions, null, 2));

// search-index.json
const searchIndex = tasks.map((t) => ({
  num: t.num,
  title: t.title,
  domainSlug: t.domainSlug,
  taskSlug: t.taskSlug,
  domainNum: parseInt(t.num, 10),
  traps: t.traps.map((x) => x.trap),
  concept: (t.blocks.find((b) => b.type === "p") || {}).text || "",
}));
writeFileSync(join(OUT_DIR, "search-index.json"), JSON.stringify(searchIndex, null, 2));

// traps.json — sumber data halaman Cheat Sheet & Drill.
// Di-fetch saat runtime biar halaman client nggak nge-bundle tasks.json (~490 KB).
const trapEntries = tasks.map((t) => ({
  num: t.num,
  title: t.title,
  domainSlug: t.domainSlug,
  taskSlug: t.taskSlug,
  domainNum: parseInt(t.num, 10),
  traps: t.traps,
}));
writeFileSync(join(OUT_DIR, "traps.json"), JSON.stringify(trapEntries, null, 2));

// mirror into public/content/ so client components can fetch at runtime
const PUB = join(ROOT, "public", "content");
mkdirSync(PUB, { recursive: true });
for (const name of [
  "curriculum.json",
  "questions.json",
  "search-index.json",
  "traps.json",
]) {
  writeFileSync(join(PUB, name), readFileSync(join(OUT_DIR, name)));
}

// report
console.log(`domains: ${domains.length}, tasks: ${tasks.length}, questions: ${questions.length}`);
for (const t of tasks) {
  const flag = (key) => (t.scenario[key] ? "ok" : "MISSING");
  console.log(
    `${t.num.padEnd(5)} traps:${String(t.traps.length).padStart(2)} opts:${t.scenario.options.length} ans:${flag("correct")} build:${t.build.steps.length} src:${t.sources.length} | ${t.title}`
  );
}

// scenario dump for curation
if (DUMP) {
  const dump = questions
    .map(
      (q) =>
        `### ${q.id} — ${q.taskTitle}\n${q.question}\n` +
        q.options.map((o) => `- (${o.letter}) ${o.text}`).join("\n") +
        `\n`
    )
    .join("\n");
  writeFileSync(join(OUT_DIR, "_scenarios-dump.md"), dump);
  console.log("scenario dump -> content/_scenarios-dump.md");
}
