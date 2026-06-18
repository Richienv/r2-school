import { ok, options } from "@/lib/http";
import { SUBJECTS } from "@/lib/subjects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return options();
}

export async function GET() {
  return ok({
    subjects: SUBJECTS.map((s) => ({ code: s.code, label: s.label, color: s.color })),
  });
}
