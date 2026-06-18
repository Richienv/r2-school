import { prisma } from "@/lib/prisma";
import { SUBJECTS, subjectLabel } from "@/lib/subjects";
import { cstDateStr, daysUntilCst, shiftDateStr, daysBetweenStr } from "@/lib/http";

const OPEN = { status: { notIn: ["DONE", "SUBMITTED"] } };

export interface AssignmentBrief {
  id: string;
  title: string;
  courseCode: string;
  dueDate: string;
  daysUntil: number;
  status: string;
}

function toBrief(a: {
  id: string;
  title: string;
  courseCode: string;
  dueDate: Date;
  status: string;
}): AssignmentBrief {
  return {
    id: a.id,
    title: a.title,
    courseCode: a.courseCode,
    dueDate: a.dueDate.toISOString(),
    daysUntil: daysUntilCst(a.dueDate),
    status: a.status,
  };
}

// Consecutive days with >=1 study session, counting back from today; holds at
// yesterday if today has no session yet (so the streak isn't shown as 0 mid-day).
export async function studyStreak(): Promise<number> {
  const rows = await prisma.studySession.findMany({
    select: { date: true },
    distinct: ["date"],
    orderBy: { date: "desc" },
  });
  const dates = new Set(rows.map((r) => r.date));
  if (dates.size === 0) return 0;
  const today = cstDateStr();
  const yesterday = shiftDateStr(today, -1);
  let cursor = dates.has(today) ? today : dates.has(yesterday) ? yesterday : null;
  if (!cursor) return 0;
  let streak = 0;
  while (dates.has(cursor)) {
    streak++;
    cursor = shiftDateStr(cursor, -1);
  }
  return streak;
}

// Most recent study date (YYYY-MM-DD) per course code.
export async function lastStudiedByCourse(): Promise<Record<string, string>> {
  const rows = await prisma.studySession.groupBy({
    by: ["courseCode"],
    _max: { date: true },
  });
  const out: Record<string, string> = {};
  for (const r of rows) if (r._max.date) out[r.courseCode] = r._max.date;
  return out;
}

export interface TodaySnapshot {
  date: string;
  assignmentsDue: AssignmentBrief[];
  assignmentsOverdue: AssignmentBrief[];
  studyToday: { minutes: number; sessions: number; byCourse: Record<string, number> };
  streak: { studyDays: number };
  neglect: { courseCode: string; label: string; daysSince: number; nextDue: AssignmentBrief | null }[];
  summary: string;
}

export async function buildToday(): Promise<TodaySnapshot> {
  const today = cstDateStr();

  const open = await prisma.assignment.findMany({ where: OPEN, orderBy: { dueDate: "asc" } });
  const assignmentsDue: AssignmentBrief[] = [];
  const assignmentsOverdue: AssignmentBrief[] = [];
  for (const a of open) {
    const b = toBrief(a);
    if (b.daysUntil < 0) assignmentsOverdue.push(b);
    else assignmentsDue.push(b);
  }

  const todaySessions = await prisma.studySession.findMany({ where: { date: today } });
  const byCourse: Record<string, number> = {};
  let minutes = 0;
  for (const s of todaySessions) {
    minutes += s.durationMin;
    byCourse[s.courseCode] = (byCourse[s.courseCode] ?? 0) + s.durationMin;
  }

  const streak = await studyStreak();
  const lastStudied = await lastStudiedByCourse();

  // Neglect: subjects untouched >4 days that have an open assignment due <=7 days.
  const neglect: TodaySnapshot["neglect"] = [];
  for (const s of SUBJECTS) {
    const last = lastStudied[s.code];
    const daysSince = last ? daysBetweenStr(last, today) : 9999;
    if (daysSince <= 4) continue;
    const nextDue = assignmentsDue.find((a) => a.courseCode === s.code && a.daysUntil <= 7) ?? null;
    if (!nextDue) continue;
    neglect.push({ courseCode: s.code, label: s.label, daysSince, nextDue });
  }
  neglect.sort((a, b) => a.nextDue!.daysUntil - b.nextDue!.daysUntil);

  const dueThisWeek = assignmentsDue.filter((a) => a.daysUntil <= 7).length;
  const soonest = assignmentsDue[0];
  const parts: string[] = [];
  parts.push(`${dueThisWeek} due minggu ini`);
  parts.push(`${minutes} menit belajar hari ini`);
  if (soonest) {
    parts.push(`${subjectLabel(soonest.courseCode)} ${soonest.title} ${dueLabelId(soonest.daysUntil)}`);
  }
  const summary = parts.join(" · ");

  return {
    date: today,
    assignmentsDue,
    assignmentsOverdue,
    studyToday: { minutes, sessions: todaySessions.length, byCourse },
    streak: { studyDays: streak },
    neglect,
    summary,
  };
}

export interface WeekSnapshot {
  weekStart: string;
  totalMinutes: number;
  byCourse: Record<string, number>;
  assignmentsCompleted: number;
  focusAvg: number | null;
  daysStudied: number;
}

export async function buildWeek(): Promise<WeekSnapshot> {
  const today = cstDateStr();
  const weekStart = shiftDateStr(today, -6); // 7-day rolling window inclusive

  const sessions = await prisma.studySession.findMany({
    where: { date: { gte: weekStart, lte: today } },
  });
  const byCourse: Record<string, number> = {};
  let totalMinutes = 0;
  let focusSum = 0;
  let focusCount = 0;
  const days = new Set<string>();
  for (const s of sessions) {
    totalMinutes += s.durationMin;
    byCourse[s.courseCode] = (byCourse[s.courseCode] ?? 0) + s.durationMin;
    days.add(s.date);
    if (typeof s.focus === "number") {
      focusSum += s.focus;
      focusCount++;
    }
  }

  const windowStart = new Date(weekStart + "T00:00:00Z");
  const assignmentsCompleted = await prisma.assignment.count({
    where: { status: { in: ["DONE", "SUBMITTED"] }, updatedAt: { gte: windowStart } },
  });

  return {
    weekStart,
    totalMinutes,
    byCourse,
    assignmentsCompleted,
    focusAvg: focusCount > 0 ? Math.round((focusSum / focusCount) * 10) / 10 : null,
    daysStudied: days.size,
  };
}

export interface FocusPick {
  courseCode: string;
  label: string;
  lastStudied: string | null;
  daysSince: number;
  openAssignments: number;
  nextDue: { id: string; title: string; daysUntil: number } | null;
  score: number;
  why: string;
}

export async function buildNextFocus(): Promise<FocusPick[]> {
  const today = cstDateStr();
  const lastStudied = await lastStudiedByCourse();
  const open = await prisma.assignment.findMany({ where: OPEN, orderBy: { dueDate: "asc" } });

  const openByCourse = new Map<string, AssignmentBrief[]>();
  for (const a of open) {
    const b = toBrief(a);
    const arr = openByCourse.get(b.courseCode) ?? [];
    arr.push(b);
    openByCourse.set(b.courseCode, arr);
  }

  const picks: FocusPick[] = SUBJECTS.map((s) => {
    const last = lastStudied[s.code] ?? null;
    const daysSince = last ? daysBetweenStr(last, today) : 9999;
    const courseOpen = openByCourse.get(s.code) ?? [];
    const next = courseOpen[0] ?? null;

    // neglect-score = daysSinceLastStudy × ln(openAssignments+1); ×2 if next due <3 days.
    const cappedDays = Math.min(daysSince, 60); // 9999 "never" shouldn't dominate absurdly
    let score = cappedDays * Math.log(courseOpen.length + 1);
    if (next && next.daysUntil < 3) score *= 2;
    score = Math.round(score * 100) / 100;

    return {
      courseCode: s.code,
      label: s.label,
      lastStudied: last,
      daysSince: last ? daysSince : -1,
      openAssignments: courseOpen.length,
      nextDue: next ? { id: next.id, title: next.title, daysUntil: next.daysUntil } : null,
      score,
      why: focusWhy(last, daysSince, courseOpen.length, next),
    };
  });

  picks.sort((a, b) => b.score - a.score || b.daysSince - a.daysSince);
  return picks.slice(0, 3);
}

function focusWhy(
  last: string | null,
  daysSince: number,
  openCount: number,
  next: AssignmentBrief | null
): string {
  const bits: string[] = [];
  if (!last) bits.push("belum pernah dilog");
  else if (daysSince === 0) bits.push("udah dipelajari hari ini");
  else bits.push(`udah ${daysSince} hari nggak nyentuh`);
  if (openCount > 0) bits.push(`${openCount} tugas open`);
  if (next) bits.push(`${next.title} ${dueLabelId(next.daysUntil)}`);
  return bits.join(", ") + ".";
}

// Indonesian gen-Z relative-due label.
export function dueLabelId(daysUntil: number): string {
  if (daysUntil < 0) return `telat ${Math.abs(daysUntil)} hari`;
  if (daysUntil === 0) return "hari ini";
  if (daysUntil === 1) return "besok";
  return `${daysUntil} hari lagi`;
}

export async function buildBrief(type: string): Promise<{ type: string; text: string }> {
  if (type === "week-due") return { type, text: await briefWeekDue() };
  if (type === "neglect") return { type, text: await briefNeglect() };
  if (type === "preclass") return { type, text: await briefPreclass() };
  return { type: "today", text: await briefToday() };
}

async function briefToday(): Promise<string> {
  const t = await buildToday();
  const dueToday = t.assignmentsDue.filter((a) => a.daysUntil <= 1);
  const lines: string[] = [];
  if (dueToday.length === 0 && t.assignmentsOverdue.length === 0) {
    lines.push("Hari ini santai, nggak ada yang due.");
  } else {
    const label = `${dueToday.length} due`;
    const items = dueToday
      .map((a) => `${subjectLabel(a.courseCode)} ${a.title} (${dueLabelId(a.daysUntil)})`)
      .join(", ");
    lines.push(items ? `Hari ini ${label}: ${items}.` : `${label}.`);
    if (t.assignmentsOverdue.length > 0) {
      lines.push(`Ada ${t.assignmentsOverdue.length} yang udah telat juga.`);
    }
  }
  const byCourse = Object.entries(t.studyToday.byCourse)
    .map(([c, m]) => `${subjectLabel(c)} ${m}`)
    .join(", ");
  if (t.studyToday.minutes > 0) {
    lines.push(`Udah study ${t.studyToday.minutes} menit${byCourse ? ` (${byCourse})` : ""}.`);
  } else {
    lines.push("Belum study hari ini.");
  }
  lines.push(`Streak ${t.streak.studyDays} hari.`);
  return lines.join(" ");
}

async function briefWeekDue(): Promise<string> {
  const open = await prisma.assignment.findMany({ where: OPEN, orderBy: { dueDate: "asc" } });
  const within = open.map(toBrief).filter((a) => a.daysUntil <= 7);
  if (within.length === 0) return "Minggu ini kosong, nggak ada due dalam 7 hari. Santai.";
  const items = within
    .map((a) => `${subjectLabel(a.courseCode)} ${a.title} ${dueLabelId(a.daysUntil)}`)
    .join("; ");
  return `${within.length} due minggu ini: ${items}.`;
}

async function briefNeglect(): Promise<string> {
  const today = cstDateStr();
  const lastStudied = await lastStudiedByCourse();
  const neglected = SUBJECTS.map((s) => {
    const last = lastStudied[s.code];
    const daysSince = last ? daysBetweenStr(last, today) : 9999;
    return { label: s.label, daysSince, ever: !!last };
  })
    .filter((x) => x.daysSince > 3)
    .sort((a, b) => b.daysSince - a.daysSince);
  if (neglected.length === 0) return "Semua subject ke-cover minggu ini. Mantap.";
  const items = neglected
    .slice(0, 4)
    .map((x) => (x.ever ? `${x.label} udah ${x.daysSince} hari` : `${x.label} belum disentuh sama sekali`))
    .join(". ");
  return `${items}.`;
}

async function briefPreclass(): Promise<string> {
  // No class-schedule model exists, so "next class" = course of the soonest
  // upcoming (non-overdue) open assignment. Brief = last DB week-entry topic
  // for that course (knowledge log) + its open assignments.
  const open = await prisma.assignment.findMany({ where: OPEN, orderBy: { dueDate: "asc" } });
  const upcoming = open.map(toBrief).filter((a) => a.daysUntil >= 0);
  if (upcoming.length === 0) return "Nggak ada kelas/tugas yang deket. Santai dulu.";
  const code = upcoming[0].courseCode;
  const label = subjectLabel(code);
  const courseOpen = upcoming.filter((a) => a.courseCode === code);

  const lastWeek = await prisma.weekEntry.findFirst({
    where: { courseCode: code },
    orderBy: { weekNumber: "desc" },
  });

  const lines: string[] = [`Persiapan ${label}.`];
  if (lastWeek) {
    lines.push(`Minggu lalu bahas: ${lastWeek.topicTitle}.`);
  } else {
    lines.push("Belum ada catatan minggu lalu di server.");
  }
  if (courseOpen.length > 0) {
    const items = courseOpen
      .map((a) => `${a.title} ${dueLabelId(a.daysUntil)}`)
      .join(", ");
    lines.push(`Tugas open: ${items}.`);
  }
  return lines.join(" ");
}
