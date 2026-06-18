import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// x-actor header records who performed a mutation; defaults to "richie-web".
export function getActor(req: Request): string {
  const a = req.headers.get("x-actor");
  return (a && a.trim()) || "richie-web";
}

export async function logActivity(entry: {
  actor: string;
  action: string;
  entityId?: string | null;
  entityType?: string | null;
  payload?: unknown;
}): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        actor: entry.actor,
        action: entry.action,
        entityId: entry.entityId ?? null,
        entityType: entry.entityType ?? null,
        payload: (entry.payload ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Audit logging must never break the primary request.
  }
}
