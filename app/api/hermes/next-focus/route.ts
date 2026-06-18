import { ok, fail, options } from "@/lib/http";
import { buildNextFocus } from "@/lib/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return options();
}

// "What should I study right now" — ranks subjects by neglect-score. Public.
export async function GET() {
  try {
    return ok({ picks: await buildNextFocus() });
  } catch (e) {
    return fail("next-focus-failed", String((e as Error)?.message ?? e), 500);
  }
}
