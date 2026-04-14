import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items = Array.isArray(body?.assignments) ? body.assignments : [];
  if (items.length === 0) return NextResponse.json({ imported: 0 });

  const existing = await prisma.assignment.findMany({ select: { id: true } });
  const existingIds = new Set(existing.map((e) => e.id));

  let imported = 0;
  for (const a of items) {
    if (!a?.title || !a?.dueDate) continue;
    if (a.id && existingIds.has(a.id)) continue;

    await prisma.assignment.create({
      data: {
        title: a.title,
        courseCode: a.courseCode ?? a.courseId ?? "unknown",
        type: a.type ?? "HOMEWORK",
        dueDate: new Date(a.dueDate),
        status: a.status ?? "NOT_STARTED",
        progress: a.progress ?? 0,
        description: a.description ?? null,
        notes: a.notes ?? null,
        groupMembers: a.groupMembers ?? undefined,
        checklist: a.checklist ?? undefined,
      },
    });
    imported++;
  }

  return NextResponse.json({ imported });
}
