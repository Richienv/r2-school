import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, options, readJson } from "@/lib/http";
import { isValidCourseCode, matchCourse } from "@/lib/subjects";
import { getActor, logActivity } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return options();
}

// "remind me: prof said cumulative midterm" → a Note. Structured courseCode
// wins; otherwise auto-classify from the text; otherwise global (null).
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const actor = getActor(req);

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return fail("missing-text", "text is required.", 400);

  let courseCode =
    typeof body.courseCode === "string" && isValidCourseCode(body.courseCode)
      ? body.courseCode
      : null;
  if (!courseCode) courseCode = matchCourse(text); // may stay null → global note
  const pinned = body.pinned === true;

  const note = await prisma.note.create({
    data: { text, courseCode: courseCode ?? null, pinned, source: actor },
  });
  await logActivity({
    actor,
    action: "capture-note",
    entityId: note.id,
    entityType: "Note",
    payload: { courseCode, pinned },
  });
  return ok({ note }, 201);
}
