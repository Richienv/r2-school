import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ok, fail, options, readJson } from "@/lib/http";
import { getActor, logActivity } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return options();
}

interface ChecklistItem {
  id?: string;
  text?: string;
  done?: boolean;
}

// Narrow toggler: status / progress / "mark this checklist item done".
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const actor = getActor(req);
  const id = typeof body.id === "string" ? body.id : null;
  if (!id) return fail("missing-id", "id is required.", 400);

  const existing = await prisma.assignment.findUnique({ where: { id } });
  if (!existing) return fail("not-found", `No assignment ${id}`, 404);

  const data: Prisma.AssignmentUpdateInput = {};
  let matchedItem: string | null = null;

  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.progress === "number") data.progress = Math.max(0, Math.min(100, body.progress));

  if (typeof body.doneItem === "string" && body.doneItem.trim()) {
    const checklist: ChecklistItem[] = Array.isArray(existing.checklist)
      ? (existing.checklist as unknown as ChecklistItem[])
      : [];
    const needle = body.doneItem.trim().toLowerCase();
    let found = false;
    const next = checklist.map((c) => {
      if (!found && typeof c?.text === "string" && c.text.toLowerCase().includes(needle)) {
        found = true;
        matchedItem = c.text;
        return { ...c, done: true };
      }
      return c;
    });
    if (!found) {
      return fail("checklist-item-not-found", `No checklist item matching "${body.doneItem}".`, 404);
    }
    data.checklist = next as unknown as Prisma.InputJsonValue;
    // Auto-derive progress from checklist completion unless explicitly given.
    if (body.progress === undefined && next.length > 0) {
      data.progress = Math.round((next.filter((c) => c.done).length / next.length) * 100);
    }
  }

  if (Object.keys(data).length === 0) {
    return fail("nothing-to-update", "Provide status, progress, or doneItem.", 400);
  }

  const updated = await prisma.assignment.update({ where: { id }, data });
  await logActivity({
    actor,
    action: "update-assignment",
    entityId: id,
    entityType: "Assignment",
    payload: { status: body.status, progress: data.progress, matchedItem },
  });
  return ok({ assignment: updated, matchedItem });
}
