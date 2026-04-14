import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const found = await prisma.assignment.findUnique({ where: { id: params.id } });
  if (!found) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(found);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.courseCode !== undefined) data.courseCode = body.courseCode;
  if (body.courseId !== undefined) data.courseCode = body.courseId;
  if (body.type !== undefined) data.type = body.type;
  if (body.dueDate !== undefined) data.dueDate = new Date(body.dueDate);
  if (body.status !== undefined) data.status = body.status;
  if (body.progress !== undefined) data.progress = body.progress;
  if (body.description !== undefined) data.description = body.description;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.groupMembers !== undefined) data.groupMembers = body.groupMembers;
  if (body.checklist !== undefined) data.checklist = body.checklist;

  const updated = await prisma.assignment.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.assignment.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
