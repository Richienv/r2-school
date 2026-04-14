import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const list = await prisma.assignment.findMany({ orderBy: { dueDate: "asc" } });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await prisma.assignment.create({
    data: {
      title: body.title,
      courseCode: body.courseCode ?? body.courseId,
      type: body.type,
      dueDate: new Date(body.dueDate),
      status: body.status ?? "NOT_STARTED",
      progress: body.progress ?? 0,
      description: body.description ?? null,
      notes: body.notes ?? null,
      groupMembers: body.groupMembers ?? undefined,
      checklist: body.checklist ?? undefined,
    },
  });
  return NextResponse.json(created);
}
