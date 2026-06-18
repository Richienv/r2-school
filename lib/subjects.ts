// Server-safe canonical course vocabulary for the Hermes/Ren integration.
// MUST mirror lib/courses.ts DEFAULT_COURSES, but carries NO "use client"
// directive so it is importable from /api/* route handlers (Phase 1.5 trap).

export interface Subject {
  code: string;
  label: string;
  color: string;
  aliases: string[];
}

export const SUBJECTS: Subject[] = [
  {
    code: "ib",
    label: "International Business",
    color: "#2D7DD2",
    aliases: ["international business", "intl business", "int business", "ib"],
  },
  {
    code: "sm",
    label: "Strategic Management",
    color: "#7B2FBE",
    aliases: ["strategic management", "strategy", "strategic", "sm"],
  },
  {
    code: "innovation",
    label: "Innovation & Change",
    color: "#E8FF47",
    aliases: ["innovation and change", "innovation & change", "innovation", "innovate", "change", "inn"],
  },
  {
    code: "blockchain",
    label: "Blockchain",
    color: "#F7931A",
    aliases: ["blockchain", "block chain", "crypto", "web3", "bc"],
  },
  {
    code: "ai",
    label: "AI Decision Making",
    color: "#00D4AA",
    aliases: ["ai decision making", "artificial intelligence", "decision making", "machine learning", "ai", "ml"],
  },
  {
    code: "chinese",
    label: "Chinese (HSK)",
    color: "#FF6B6B",
    aliases: ["chinese", "mandarin", "putonghua", "hsk", "cn"],
  },
];

export const SUBJECT_CODES: string[] = SUBJECTS.map((s) => s.code);

export function isValidCourseCode(code: string | null | undefined): boolean {
  return !!code && SUBJECT_CODES.includes(code);
}

export function getSubject(code: string | null | undefined): Subject | undefined {
  if (!code) return undefined;
  return SUBJECTS.find((s) => s.code === code);
}

export function subjectLabel(code: string | null | undefined): string {
  return getSubject(code)?.label ?? (code ?? "—");
}

// Fuzzy-match free text to a subject code. Prefers the longest (most specific)
// alias hit. Returns null when nothing matches confidently.
export function matchCourse(input: string | null | undefined): string | null {
  if (!input) return null;
  const text =
    " " +
    input
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim() +
    " ";
  let best: { code: string; len: number } | null = null;
  for (const s of SUBJECTS) {
    for (const a of s.aliases) {
      const needle = " " + a.toLowerCase().trim() + " ";
      if (text.includes(needle) && (!best || a.length > best.len)) {
        best = { code: s.code, len: a.length };
      }
    }
  }
  return best?.code ?? null;
}
