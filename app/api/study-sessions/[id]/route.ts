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

// This path is "public" in middleware (so the collection GET stays open), so
// the DELETE must enforce the key itself.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(req)) {
    return fail("unauthorized", "Invalid or missing x-api-key", 401);
  }
  try {
    await prisma.studySession.delete({ where: { id: params.id } });
  } catch {
    return fail("not-found", `No study session ${params.id}`, 404);
  }
  await logActivity({
    actor: getActor(req),
    action: "delete-study-session",
    entityId: params.id,
    entityType: "StudySession",
  });
  return ok({ deleted: params.id });
}
