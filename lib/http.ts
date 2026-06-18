import { NextResponse } from "next/server";

// CORS + no-store for every new Hermes-facing endpoint. Hermes calls
// cross-origin from anywhere, so allow the custom auth headers too.
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, x-actor, authorization",
  "Cache-Control": "no-store",
};

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status, headers: corsHeaders });
}

export function fail(error: string, message: string, status = 400) {
  return NextResponse.json({ ok: false, error, message }, { status, headers: corsHeaders });
}

export function options() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const b = await req.json();
    return b && typeof b === "object" && !Array.isArray(b) ? (b as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

// --- CST (UTC+8) date helpers — matches /api/summary's offset convention ---

export const CST_OFFSET_MS = 8 * 60 * 60 * 1000;

export function cstNow(): Date {
  return new Date(Date.now() + CST_OFFSET_MS);
}

// YYYY-MM-DD in CST for a given instant (defaults to now).
export function cstDateStr(d: Date = new Date()): string {
  return new Date(d.getTime() + CST_OFFSET_MS).toISOString().slice(0, 10);
}

// Whole calendar days from today (CST) until the given due instant.
export function daysUntilCst(due: Date): number {
  const a = new Date(cstDateStr() + "T00:00:00Z").getTime();
  const b = new Date(cstDateStr(due) + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86400000);
}

// Parse a date-ish value, returning null on garbage (avoids Invalid Date rows).
export function parseDate(v: unknown): Date | null {
  if (typeof v !== "string" && typeof v !== "number") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

// Add/subtract whole days from a YYYY-MM-DD string.
export function shiftDateStr(dateStr: string, deltaDays: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

// Whole calendar days between two YYYY-MM-DD strings (b - a).
export function daysBetweenStr(a: string, b: string): number {
  const ta = new Date(a + "T00:00:00Z").getTime();
  const tb = new Date(b + "T00:00:00Z").getTime();
  return Math.round((tb - ta) / 86400000);
}
