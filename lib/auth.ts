// Key extraction + comparison, shared by the health endpoint and the
// in-handler guards on public-path DELETE routes (study-sessions, notes),
// which the middleware treats as public and therefore does not protect.

export function extractKey(req: Request): string {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  // LESSON #1: trim invisible trailing whitespace from pasted env vars.
  return (req.headers.get("x-api-key") ?? bearer ?? "").trim();
}

export function expectedKey(): string {
  return (process.env.R2_SCHOOL_API_KEY ?? "").trim();
}

export function isAuthorized(req: Request): boolean {
  const key = extractKey(req);
  const expected = expectedKey();
  return !!key && !!expected && key === expected;
}
