import { NextRequest } from "next/server";
import { ok, fail, options, readJson } from "@/lib/http";
import { buildBrief } from "@/lib/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = ["today", "week-due", "neglect", "preclass"];

export async function OPTIONS() {
  return options();
}

// The briefing voice — Indonesian gen-Z. Auth required (mutating? no, but kept
// behind the key with the rest of /api/hermes/* writes for a single contract).
export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const requested = typeof body.type === "string" ? body.type : "today";
  const type = ALLOWED.includes(requested) ? requested : "today";
  try {
    return ok(await buildBrief(type));
  } catch (e) {
    return fail("brief-failed", String((e as Error)?.message ?? e), 500);
  }
}
