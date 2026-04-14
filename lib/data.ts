"use client";

import type { Assignment, ClassNote, Course, WeekEntry } from "./types";

export const COURSES: Course[] = [
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

export function getCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

const LEGACY_ASSIGN_KEY = "r2school.assignments.v2";
const LEGACY_SYNC_FLAG = "r2school.synced.v2";
const NOTES_KEY = "r2school.notes.v2";
const COURSE_NOTES_KEY = "r2school.coursenotes.v1";
const WEEK_ENTRIES_KEY = "r2school.weekentries.v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeAssignment(raw: Record<string, unknown>): Assignment {
  const due = raw.dueDate as string | undefined;
  const dateOnly = due ? new Date(due).toISOString().slice(0, 10) : "";
  const created = raw.createdAt as string | undefined;
  const createdDate = created ? new Date(created).toISOString().slice(0, 10) : "";
  return {
    id: String(raw.id ?? ""),
    courseId: String(raw.courseCode ?? raw.courseId ?? ""),
    title: String(raw.title ?? ""),
    type: raw.type as Assignment["type"],
    dueDate: dateOnly,
    status: (raw.status as Assignment["status"]) ?? "NOT_STARTED",
    description: (raw.description as string) ?? undefined,
    groupMembers: (raw.groupMembers as string[]) ?? undefined,
    notes: (raw.notes as string) ?? undefined,
    checklist: (raw.checklist as Assignment["checklist"]) ?? undefined,
    progress: (raw.progress as number) ?? 0,
    createdAt: createdDate,
  };
}

export async function loadAssignments(): Promise<Assignment[]> {
  if (!isBrowser()) return [];
  try {
    const res = await fetch("/api/assignments", { cache: "no-store" });
    if (!res.ok) return [];
    const list = (await res.json()) as Record<string, unknown>[];
    return list.map(normalizeAssignment);
  } catch {
    return [];
  }
}

export async function createAssignment(a: Omit<Assignment, "id" | "createdAt">): Promise<Assignment | null> {
  try {
    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: a.title,
        courseCode: a.courseId,
        type: a.type,
        dueDate: a.dueDate,
        status: a.status,
        progress: a.progress ?? 0,
        description: a.description,
        notes: a.notes,
        groupMembers: a.groupMembers,
        checklist: a.checklist,
      }),
    });
    if (!res.ok) return null;
    return normalizeAssignment(await res.json());
  } catch {
    return null;
  }
}

export async function updateAssignment(id: string, patch: Partial<Assignment>): Promise<Assignment | null> {
  try {
    const body: Record<string, unknown> = { ...patch };
    if (patch.courseId !== undefined) {
      body.courseCode = patch.courseId;
      delete body.courseId;
    }
    const res = await fetch(`/api/assignments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return normalizeAssignment(await res.json());
  } catch {
    return null;
  }
}

export async function deleteAssignment(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function syncLegacyAssignments(): Promise<void> {
  if (!isBrowser()) return;
  try {
    console.log("[sync] all localStorage keys:", Object.keys(localStorage));

    if (localStorage.getItem(LEGACY_SYNC_FLAG)) {
      console.log("[sync] already synced, skipping");
      return;
    }

    const candidateKeys = Object.keys(localStorage).filter((k) =>
      k.toLowerCase().includes("assignment")
    );
    console.log("[sync] candidate assignment keys:", candidateKeys);

    let parsed: Assignment[] = [];
    for (const key of [LEGACY_ASSIGN_KEY, ...candidateKeys]) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length > 0) {
          console.log(`[sync] found ${arr.length} items in "${key}"`);
          parsed = arr as Assignment[];
          break;
        }
      } catch {}
    }

    if (parsed.length === 0) {
      console.log("[sync] no legacy assignments found, marking synced");
      localStorage.setItem(LEGACY_SYNC_FLAG, "1");
      return;
    }

    const payload = parsed.map((a) => ({
      title: a.title,
      courseCode: a.courseId,
      type: a.type,
      dueDate: a.dueDate,
      status: a.status,
      progress: a.progress ?? 0,
      description: a.description,
      notes: a.notes,
      groupMembers: a.groupMembers,
      checklist: a.checklist,
    }));

    console.log(`[sync] POSTing ${payload.length} assignments to /api/assignments/sync`);
    const res = await fetch("/api/assignments/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignments: payload }),
    });
    const body = await res.json().catch(() => ({}));
    console.log("[sync] response:", res.status, body);

    if (res.ok) {
      localStorage.setItem(LEGACY_SYNC_FLAG, "1");
      localStorage.removeItem(LEGACY_ASSIGN_KEY);
      console.log("[sync] migration complete, localStorage cleared");
    }
  } catch (err) {
    console.error("[sync] error:", err);
  }
}

export function loadNotes(): ClassNote[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? (JSON.parse(raw) as ClassNote[]) : [];
  } catch {
    return [];
  }
}

export function saveNote(n: ClassNote) {
  if (!isBrowser()) return;
  const list = loadNotes();
  list.unshift(n);
  localStorage.setItem(NOTES_KEY, JSON.stringify(list));
}

export function daysUntil(dueDate: string, now = new Date()): number {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function urgencyColor(days: number): "danger" | "warning" | "accent" | "muted" {
  if (days <= 2) return "danger";
  if (days <= 5) return "warning";
  if (days <= 14) return "accent";
  return "muted";
}

export type DaysVariant = "danger" | "hot" | "cool";

export function daysDisplay(days: number, threshold: number): { label: string; variant: DaysVariant } {
  if (days < 0) return { label: "OVERDUE", variant: "danger" };
  if (days === 0) return { label: "TODAY", variant: "danger" };
  if (days <= threshold) return { label: `${days}D`, variant: "hot" };
  return { label: `${days}D`, variant: "cool" };
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function typeLabel(t: string): string {
  return t.replace(/_/g, " ");
}

export function loadWeekEntries(): WeekEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(WEEK_ENTRIES_KEY);
    return raw ? (JSON.parse(raw) as WeekEntry[]) : [];
  } catch {
    return [];
  }
}

export function getWeekEntry(courseId: string, weekNumber: number): WeekEntry | undefined {
  return loadWeekEntries().find((e) => e.courseId === courseId && e.weekNumber === weekNumber);
}

export function upsertWeekEntry(entry: WeekEntry) {
  if (!isBrowser()) return;
  const list = loadWeekEntries();
  const idx = list.findIndex(
    (e) => e.courseId === entry.courseId && e.weekNumber === entry.weekNumber
  );
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  localStorage.setItem(WEEK_ENTRIES_KEY, JSON.stringify(list));
}

export function deleteWeekEntry(id: string) {
  if (!isBrowser()) return;
  const list = loadWeekEntries().filter((e) => e.id !== id);
  localStorage.setItem(WEEK_ENTRIES_KEY, JSON.stringify(list));
}

export function currentWeekNumber(semesterStart: string, now = new Date()): number {
  try {
    const start = new Date(semesterStart);
    start.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const days = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const w = Math.floor(days / 7) + 1;
    return Math.max(1, Math.min(16, w));
  } catch {
    return 1;
  }
}

export function loadCourseNote(courseId: string): string {
  if (!isBrowser()) return "";
  try {
    const raw = localStorage.getItem(COURSE_NOTES_KEY);
    if (!raw) return "";
    const map = JSON.parse(raw) as Record<string, string>;
    return map[courseId] ?? "";
  } catch {
    return "";
  }
}

export function saveCourseNote(courseId: string, content: string) {
  if (!isBrowser()) return;
  try {
    const raw = localStorage.getItem(COURSE_NOTES_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[courseId] = content;
    localStorage.setItem(COURSE_NOTES_KEY, JSON.stringify(map));
  } catch {}
}

export function newId(): string {
  return "id-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
