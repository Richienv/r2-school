import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, options, readJson, cstDateStr, shiftDateStr } from "@/lib/http";
import { isValidCourseCode, matchCourse } from "@/lib/subjects";
import { parseDuration, parseFocus, guessTopic } from "@/lib/nlp";
import { getActor, logActivity } from "@/lib/audit";
import { buildToday } from "@/lib/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return options();
}

// Ren's voice study log. Prefers STRUCTURED fields; falls back to NL { text }.
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const actor = getActor(req);

  let courseCode = typeof body.courseCode === "string" ? body.courseCode : null;
  let durationMin = typeof body.durationMin === "number" ? body.durationMin : null;
  let focus = typeof body.focus === "number" ? body.focus : null;
  let topic = typeof body.topic === "string" ? body.topic : null;
  const notes = typeof body.notes === "string" ? body.notes : null;
  let date =
    typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : null;
  const text = typeof body.text === "string" ? body.text : null;

  // NL fallback fills any missing structured field.
  if (text) {
    if (!courseCode) courseCode = matchCourse(text);
    if (durationMin == null) durationMin = parseDuration(text);
    if (focus == null) focus = parseFocus(text);
    if (!topic) topic = guessTopic(text);
  }

  if (!courseCode || !isValidCourseCode(courseCode)) {
    return fail(
      "course-unmatched",
      "Couldn't resolve a course; pass courseCode (one of: ib, sm, innovation, blockchain, ai, chinese).",
      400
    );
  }
  if (durationMin == null || !(durationMin > 0)) {
    return fail("duration-missing", "Couldn't resolve a duration; pass durationMin (minutes).", 400);
  }
  if (focus != null) focus = Math.max(1, Math.min(5, Math.round(focus)));
  if (!date) date = cstDateStr();

  const session = await prisma.studySession.create({
    data: {
      date,
      courseCode,
      durationMin: Math.round(durationMin),
      focus: focus ?? undefined,
      topic: topic ?? undefined,
      notes: notes ?? undefined,
    },
  });

  await logActivity({
    actor,
    action: "log-study",
    entityId: session.id,
    entityType: "StudySession",
    payload: { courseCode, durationMin: session.durationMin, focus, topic, via: text ? "nl" : "structured" },
  });

  const today = cstDateStr();
  const weekStart = shiftDateStr(today, -6);
  const [todayAgg, weekAgg, snap] = await Promise.all([
    prisma.studySession.aggregate({ _sum: { durationMin: true }, where: { date: today } }),
    prisma.studySession.aggregate({
      _sum: { durationMin: true },
      where: { date: { gte: weekStart, lte: today } },
    }),
    buildToday(),
  ]);

  return ok(
    {
      session,
      todayMinutes: todayAgg._sum.durationMin ?? 0,
      weekMinutes: weekAgg._sum.durationMin ?? 0,
      neglect: snap.neglect,
    },
    201
  );
}
