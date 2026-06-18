"use client";

import { useEffect, useState } from "react";
import { DATA_EVENT, STUDY_KEY } from "@/lib/useSoftRefresh";

export interface StudySessionView {
  id: string;
  date: string; // YYYY-MM-DD (CST)
  courseCode: string;
  durationMin: number;
  focus: number | null;
  topic: string | null;
  notes: string | null;
  startedAt: string;
}

function read(): StudySessionView[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STUDY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as StudySessionView[]) : [];
  } catch {
    return [];
  }
}

// Reads the ServerSync-maintained mirror of /api/study-sessions and re-reads on
// every soft-refresh pulse, so Hermes-logged sessions surface within ~60s.
export function useStudySessions(): StudySessionView[] {
  const [sessions, setSessions] = useState<StudySessionView[]>([]);
  useEffect(() => {
    setSessions(read());
    const handler = () => setSessions(read());
    window.addEventListener(DATA_EVENT, handler);
    return () => window.removeEventListener(DATA_EVENT, handler);
  }, []);
  return sessions;
}
