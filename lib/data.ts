"use client";

import type { Assignment, ClassNote, Course } from "./types";

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
    name: "Innovation",
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
    name: "Chinese",
    shortName: "CN",
    professor: "Prof.",
    color: "#FF6B6B",
    active: true,
  },
];

export function getCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: "seed-ib-openai",
    courseId: "ib",
    title: "OpenAI vs DeepSeek",
    type: "GROUP_PRESENTATION",
    dueDate: "2026-04-15",
    status: "IN_PROGRESS",
    description: "Group 6 comparative strategy presentation",
    groupMembers: ["Richie", "Member 2", "Member 3", "Member 4", "Member 5"],
    notes: "",
    progress: 40,
    checklist: [
      { id: "c1", text: "Research OpenAI background", done: true },
      { id: "c2", text: "Research DeepSeek background", done: true },
      { id: "c3", text: "Build slides", done: false },
      { id: "c4", text: "Practice presentation", done: false },
    ],
    createdAt: "2026-04-01",
  },
  {
    id: "seed-sm-case",
    courseId: "sm",
    title: "Weekly case analysis",
    type: "HOMEWORK",
    dueDate: "2026-04-20",
    status: "NOT_STARTED",
    description: "Individual case write-up",
    notes: "",
    progress: 0,
    checklist: [],
    createdAt: "2026-04-01",
  },
  {
    id: "seed-inn-anthropic",
    courseId: "innovation",
    title: "Anthropic ecosystem proposal",
    type: "INDIVIDUAL_PROJECT",
    dueDate: "2026-04-20",
    status: "IN_PROGRESS",
    description: "Week 4 team project",
    groupMembers: ["Ruitong", "He Yan", "Siwen", "Richie", "Enjia"],
    notes: "",
    progress: 20,
    checklist: [],
    createdAt: "2026-04-01",
  },
];

const ASSIGN_KEY = "r2school.assignments.v2";
const NOTES_KEY = "r2school.notes.v2";
const SEED_FLAG = "r2school.seeded.v2";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadAssignments(): Assignment[] {
  if (!isBrowser()) return [];
  try {
    const seeded = localStorage.getItem(SEED_FLAG);
    if (!seeded) {
      localStorage.setItem(ASSIGN_KEY, JSON.stringify(SEED_ASSIGNMENTS));
      localStorage.setItem(SEED_FLAG, "1");
      return SEED_ASSIGNMENTS;
    }
    const raw = localStorage.getItem(ASSIGN_KEY);
    return raw ? (JSON.parse(raw) as Assignment[]) : [];
  } catch {
    return [];
  }
}

export function saveAssignments(list: Assignment[]) {
  if (!isBrowser()) return;
  localStorage.setItem(ASSIGN_KEY, JSON.stringify(list));
}

export function upsertAssignment(a: Assignment) {
  const list = loadAssignments();
  const idx = list.findIndex((x) => x.id === a.id);
  if (idx >= 0) list[idx] = a;
  else list.push(a);
  saveAssignments(list);
}

export function deleteAssignment(id: string) {
  const list = loadAssignments().filter((x) => x.id !== id);
  saveAssignments(list);
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
  const d = new Date(dueDate + "T23:59:59");
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const ms = d.getTime() - today.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function urgencyColor(days: number): "danger" | "warning" | "accent" | "muted" {
  if (days <= 2) return "danger";
  if (days <= 5) return "warning";
  if (days <= 14) return "accent";
  return "muted";
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function typeLabel(t: string): string {
  return t.replace(/_/g, " ");
}

export function newId(): string {
  return "id-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
