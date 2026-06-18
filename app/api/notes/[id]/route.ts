import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, options } from "@/lib/http";
import { isAuthorized } from "@/lib/auth";
import { getActor, logActivity } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return options();
}

// Public path in middleware (collection GET stays open) → enforce key here.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(req)) {
    return fail("unauthorized", "Invalid or missing x-api-key", 401);
  }
  try {
    await prisma.note.delete({ where: { id: params.id } });
  } catch {
    return fail("not-found", `No note ${params.id}`, 404);
  }
  await logActivity({
    actor: getActor(req),
    action: "delete-note",
    entityId: params.id,
    entityType: "Note",
  });
  return ok({ deleted: params.id });
}
