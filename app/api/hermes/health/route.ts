import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, options } from "@/lib/http";
import { extractKey } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return options();
}

// The single best debugging tool — reports key + DB status without leaking
// the secret. Public (GET).
export async function GET(req: NextRequest) {
  const raw = process.env.R2_SCHOOL_API_KEY ?? "";
  const trimmed = raw.trim();
  const keyConfigured = trimmed.length > 0;
  const keyHadWhitespace = raw !== trimmed;
  const keyPreview = keyConfigured
    ? `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`
    : null;

  const headerKey = extractKey(req);
  // Spec: true when a provided key matches, otherwise null.
  const keyMatch = keyConfigured && headerKey ? headerKey === trimmed || null : null;

  const db: { connected: boolean; error: string | null } = { connected: false, error: null };
  try {
    await prisma.$queryRaw`SELECT 1`;
    db.connected = true;
  } catch (e) {
    db.error = String((e as Error)?.message ?? e);
  }

  return ok({
    keyConfigured,
    keyLength: trimmed.length,
    keyHadWhitespace,
    keyPreview,
    keyMatch,
    db,
    deployedAt: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null,
  });
}
