import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public API paths. GET is always allowed (read-only safe); these paths are
// additionally allowed for the existing browser UI's unauthenticated mutations
// (e.g. the assignment CRUD the app already ships). New agent mutation
// endpoints live under /api/hermes/* and are NOT public, so they require a key.
const PUBLIC_PATHS = [
  "/api/summary",
  "/api/assignments",
  "/api/today",
  "/api/week",
  "/api/subjects",
  "/api/study-sessions",
  "/api/notes",
];

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/")) return NextResponse.next();

  const isPublic = PUBLIC_PATHS.some((p) => req.nextUrl.pathname.startsWith(p));
  const isMutation = ["POST", "PATCH", "PUT", "DELETE"].includes(req.method);
  if (isPublic || !isMutation) return NextResponse.next();

  // LESSON #1: pasted Vercel env vars often carry an invisible trailing
  // newline — trim both sides. Also accept Authorization: Bearer <key>.
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const key = (req.headers.get("x-api-key") ?? bearer ?? "").trim();
  const expected = (process.env.R2_SCHOOL_API_KEY ?? "").trim();
  if (!key || !expected || key !== expected) {
    return NextResponse.json(
      { ok: false, error: "unauthorized", message: "Invalid or missing x-api-key" },
      { status: 401 }
    );
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
