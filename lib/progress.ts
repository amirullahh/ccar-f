"use client";

import { useCallback, useEffect, useState } from "react";

export interface TaskProgress {
  read?: boolean;
  quizCorrect?: boolean;
  quizAttempts?: number;
}

export interface ExamRun {
  date: string;
  score: number;
  total: number;
}

export interface DiagnosticRun {
  date: string;
  byDomain: Record<string, { ok: number; total: number }>;
}

export interface ProgressState {
  tasks: Record<string, TaskProgress>;
  examRuns: ExamRun[];
  /** Kartu drill yang ditandai "udah kuat" — key = id kartu. */
  drill: Record<string, boolean>;
  diagnostics: DiagnosticRun[];
}

const KEY = "ccar-progress-v1";
const EVT = "ccar-progress-change";

const EMPTY: ProgressState = { tasks: {}, examRuns: [], drill: {}, diagnostics: [] };

export function getProgress(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    // Toleran sama data lama yang belum punya field drill/diagnostics.
    return {
      tasks: parsed.tasks ?? {},
      examRuns: parsed.examRuns ?? [],
      drill: parsed.drill ?? {},
      diagnostics: parsed.diagnostics ?? [],
    };
  } catch {
    return EMPTY;
  }
}

function setProgress(next: ProgressState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVT));
  } catch {
    // localStorage penuh / diblokir — abaikan, jangan sampai crash halaman.
  }
}

export function updateTask(num: string, patch: TaskProgress) {
  const cur = getProgress();
  const prev = cur.tasks[num] ?? {};
  setProgress({
    ...cur,
    tasks: { ...cur.tasks, [num]: { ...prev, ...patch } },
  });
}

export function addExamRun(score: number, total: number) {
  const cur = getProgress();
  setProgress({
    ...cur,
    examRuns: [...cur.examRuns, { date: new Date().toISOString(), score, total }].slice(-20),
  });
}

export function addDiagnostic(byDomain: DiagnosticRun["byDomain"]) {
  const cur = getProgress();
  setProgress({
    ...cur,
    diagnostics: [...cur.diagnostics, { date: new Date().toISOString(), byDomain }].slice(-10),
  });
}

export function setDrillKnown(id: string, known: boolean) {
  const cur = getProgress();
  const drill = { ...cur.drill };
  if (known) drill[id] = true;
  else delete drill[id];
  setProgress({ ...cur, drill });
}

export function resetProgress() {
  setProgress(EMPTY);
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(EMPTY);

  useEffect(() => {
    const refresh = () => setState(getProgress());
    refresh();
    window.addEventListener(EVT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const toggleRead = useCallback((num: string) => {
    const cur = getProgress();
    const prev = cur.tasks[num] ?? {};
    updateTask(num, { read: !prev.read });
  }, []);

  const recordQuiz = useCallback((num: string, correct: boolean) => {
    const cur = getProgress();
    const prev = cur.tasks[num] ?? {};
    updateTask(num, {
      quizCorrect: correct,
      quizAttempts: (prev.quizAttempts ?? 0) + 1,
      read: true,
    });
  }, []);

  const toggleDrill = useCallback((id: string) => {
    const cur = getProgress();
    setDrillKnown(id, !cur.drill[id]);
  }, []);

  return { ...state, toggleRead, recordQuiz, toggleDrill };
}
