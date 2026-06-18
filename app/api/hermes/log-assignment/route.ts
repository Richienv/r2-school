import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ok, fail, options, readJson, parseDate } from "@/lib/http";
import { isValidCourseCode } from "@/lib/subjects";
import { getActor, logActivity } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return options();
}

// Create (no id) or update (id provided, PUT semantics) an assignment.
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const actor = getActor(req);
  const id = typeof body.id === "string" ? body.id : null;

  if (id) {
    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) return fail("not-found", `No assignment ${id}`, 404);

    const data: Prisma.AssignmentUpdateInput = {};
    if (typeof body.title === "string") data.title = body.title;
    if (typeof body.courseCode === "string") {
      if (!isValidCourseCode(body.courseCode))
        return fail("bad-course", "courseCode must be one of the 6 slugs.", 400);
      data.courseCode = body.courseCode;
    }
    if (typeof body.type === "string") data.type = body.type;
    if (body.dueDate !== undefined) {
      const d = parseDate(body.dueDate);
      if (!d) return fail("bad-date", "dueDate is not a valid date.", 400);
      data.dueDate = d;
    }
    if (typeof body.status === "string") data.status = body.status;
    if (typeof body.progress === "number") data.progress = Math.max(0, Math.min(100, body.progress));
    if (body.description !== undefined) data.description = (body.description as string) ?? null;
    if (body.notes !== undefined) data.notes = (body.notes as string) ?? null;
    if (body.checklist !== undefined) data.checklist = body.checklist as Prisma.InputJsonValue;

    const updated = await prisma.assignment.update({ where: { id }, data });
    await logActivity({
      actor,
      action: "update-assignment",
      entityId: id,
      entityType: "Assignment",
      payload: data as unknown,
    });
    return ok({ assignment: updated, mode: "update" });
  }

  // create
  if (!body.title || !body.courseCode || body.dueDate === undefined) {
    return fail("missing-fields", "title, courseCode and dueDate are required to create.", 400);
  }
  if (!isValidCourseCode(String(body.courseCode))) {
    return fail("bad-course", "courseCode must be one of: ib, sm, innovation, blockchain, ai, chinese.", 400);
  }
  const due = parseDate(body.dueDate);
  if (!due) return fail("bad-date", "dueDate is not a valid date.", 400);

  const created = await prisma.assignment.create({
    data: {
      title: String(body.title),
      courseCode: String(body.courseCode),
      type: typeof body.type === "string" ? body.type : "HOMEWORK",
      dueDate: due,
      status: typeof body.status === "string" ? body.status : "NOT_STARTED",
      progress: typeof body.progress === "number" ? Math.max(0, Math.min(100, body.progress)) : 0,
      description: (body.description as string) ?? null,
      notes: (body.notes as string) ?? null,
      checklist: (body.checklist as Prisma.InputJsonValue) ?? undefined,
    },
  });
  await logActivity({
    actor,
    action: "create-assignment",
    entityId: created.id,
    entityType: "Assignment",
    payload: { title: created.title, courseCode: created.courseCode, dueDate: created.dueDate },
  });
  return ok({ assignment: created, mode: "create" }, 201);
}
