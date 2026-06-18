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
    const from = searchParams.get("from");
    const courseCode = searchParams.get("courseCode");
    const where: { date?: { gte: string }; courseCode?: string } = {};
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) where.date = { gte: from };
    if (courseCode && isValidCourseCode(courseCode)) where.courseCode = courseCode;
    const sessions = await prisma.studySession.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: 200,
    });
    return ok({ sessions });
  } catch (e) {
    return fail("study-sessions-failed", String((e as Error)?.message ?? e), 500);
  }
}
