"use client";

import { useEffect, useState } from "react";
import type { Course } from "./types";

export const DEFAULT_COURSES: Course[] = [
  {
    id: "ib",
    name: "International Business",
    shortName: "IB",
    professor: "Prof. Simon Collinson",
    color: "#2D7DD2",
    active: true,
  },
  {
    id: "sm",
    name: "Strategic Management",
    shortName: "SM",
    professor: "Prof.",
    color: "#7B2FBE",
    active: true,
  },
  {
    id: "innovation",
    name: "Innovation & Change",
    shortName: "INN",
    professor: "Prof. Wenjing Lyu",
    color: "#E8FF47",
    active: true,
  },
  {
    id: "blockchain",
    name: "Blockchain",
    shortName: "BC",
    professor: "Prof.",
    color: "#F7931A",
    active: true,
  },
  {
    id: "ai",
    name: "AI Decision Making",
    shortName: "AI",
    professor: "Prof.",
    color: "#00D4AA",
    active: true,
  },
  {
    id: "chinese",
    name: "Chinese (HSK)",
    shortName: "CN",
    professor: "Prof.",
    color: "#FF6B6B",
    active: true,
  },
];

const KEY = "r2school.courses.v1";
const EVENT = "r2school:courses";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAllCourses(): Course[] {
  if (!isBrowser()) return DEFAULT_COURSES;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_COURSES;
    const parsed = JSON.parse(raw) as Course[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_COURSES;
    return parsed;
  } catch {
    return DEFAULT_COURSES;
  }
}

export function getCourseById(id: string): Course | undefined {
  return getAllCourses().find((c) => c.id === id);
}

function emit(list: Course[]) {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent<Course[]>(EVENT, { detail: list }));
}

export function saveCourses(list: Course[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(list));
  emit(list);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

export function uniqueCourseId(seed: string, existing: Course[]): string {
  const base = slugify(seed) || "course";
  if (!existing.some((c) => c.id === base)) return base;
  let i = 2;
  while (existing.some((c) => c.id === `${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export function addCourse(input: Omit<Course, "id" | "active"> & { id?: string; active?: boolean }): Course {
  const list = getAllCourses();
  const id = input.id ?? uniqueCourseId(input.shortName || input.name, list);
  const created: Course = {
    id,
    name: input.name,
    shortName: input.shortName,
    professor: input.professor,
    color: input.color,
    active: input.active ?? true,
  };
  saveCourses([...list, created]);
  return created;
}

export function updateCourse(id: string, patch: Partial<Course>): Course | undefined {
  const list = getAllCourses();
  const idx = list.findIndex((c) => c.id === id);
  if (idx < 0) return undefined;
  const next = { ...list[idx], ...patch, id: list[idx].id };
  const out = [...list];
  out[idx] = next;
  saveCourses(out);
  return next;
}

export function deleteCourse(id: string) {
  const list = getAllCourses().filter((c) => c.id !== id);
  saveCourses(list);
}

export function useCourses(): [Course[], { add: typeof addCourse; update: typeof updateCourse; remove: typeof deleteCourse }] {
  const [list, setList] = useState<Course[]>(DEFAULT_COURSES);

  useEffect(() => {
    setList(getAllCourses());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Course[]>).detail;
      if (Array.isArray(detail)) setList(detail);
      else setList(getAllCourses());
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return [list, { add: addCourse, update: updateCourse, remove: deleteCourse }];
}

export const COURSE_PALETTE: string[] = [
  "#E8FF47",
  "#2D7DD2",
  "#7B2FBE",
  "#F7931A",
  "#00D4AA",
  "#FF6B6B",
  "#FF9500",
  "#56CCF2",
  "#9B51E0",
  "#27AE60",
  "#EB5757",
  "#F2C94C",
];
