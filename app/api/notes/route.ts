import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, options } from "@/lib/http";
import { isValidCourseCode } from "@/lib/subjects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return options();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseCode = searchParams.get("courseCode");
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 20, 1), 200);
    const where: { courseCode?: string } = {};
    if (courseCode && isValidCourseCode(courseCode)) where.courseCode = courseCode;
    const notes = await prisma.note.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { capturedAt: "desc" }],
      take: limit,
    });
    return ok({ notes });
  } catch (e) {
    return fail("notes-failed", String((e as Error)?.message ?? e), 500);
  }
}
