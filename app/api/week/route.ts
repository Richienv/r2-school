import { ok, fail, options } from "@/lib/http";
import { buildWeek } from "@/lib/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return options();
}

export async function GET() {
  try {
    return ok(await buildWeek());
  } catch (e) {
    return fail("week-failed", String((e as Error)?.message ?? e), 500);
  }
}
