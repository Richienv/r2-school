"use client";

import { useEffect, useState } from "react";
import type { Grade } from "./types";

const KEY = "r2school.grades.v1";
const EVENT = "r2school:grades";

function isBrowser() {
  return typeof window !== "undefined";
}

function makeId(): string {
  return "g-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function getAllGrades(): Grade[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Grade[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(list: Grade[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent<Grade[]>(EVENT, { detail: list }));
}

export function getGradesForCourse(courseId: string): Grade[] {
  return getAllGrades().filter((g) => g.courseId === courseId);
}

export function addGrade(input: Omit<Grade, "id" | "createdAt">): Grade {
  const created: Grade = {
    id: makeId(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  persist([...getAllGrades(), created]);
  return created;
}

export function updateGrade(id: string, patch: Partial<Grade>): Grade | undefined {
  const list = getAllGrades();
  const idx = list.findIndex((g) => g.id === id);
  if (idx < 0) return undefined;
  const next = { ...list[idx], ...patch, id: list[idx].id };
  const out = [...list];
  out[idx] = next;
  persist(out);
  return next;
}

export function deleteGrade(id: string) {
  persist(getAllGrades().filter((g) => g.id !== id));
}

export function deleteGradesForCourse(courseId: string) {
  persist(getAllGrades().filter((g) => g.courseId !== courseId));
}

export interface GradeSummary {
  earned: number;
  outOf: number;
  weightUsed: number;
  weightTotal: number;
  hasScores: boolean;
}

export function summarizeGrades(grades: Grade[]): GradeSummary {
  let earned = 0;
  let outOf = 0;
  let weightUsed = 0;
  let weightTotal = 0;
  let hasScores = false;
  for (const g of grades) {
    weightTotal += g.weight;
    if (g.score !== null && g.score !== undefined) {
      hasScores = true;
      const pct = Math.max(0, Math.min(1, g.score / 100));
      earned += pct * g.weight;
      outOf += g.weight;
      weightUsed += g.weight;
    }
  }
  return { earned, outOf, weightUsed, weightTotal, hasScores };
}

export function useGrades(courseId?: string): [Grade[], { add: typeof addGrade; update: typeof updateGrade; remove: typeof deleteGrade }] {
  const [list, setList] = useState<Grade[]>([]);

  useEffect(() => {
    const read = () => {
      const all = getAllGrades();
      setList(courseId ? all.filter((g) => g.courseId === courseId) : all);
    };
    read();
    const handler = () => read();
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [courseId]);

  return [list, { add: addGrade, update: updateGrade, remove: deleteGrade }];
}
