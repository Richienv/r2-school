"use client";

import { useEffect } from "react";
import {
  STUDY_KEY,
  SERVER_NOTES_KEY,
  dispatchDataRefresh,
} from "@/lib/useSoftRefresh";

// Pull server-owned data (study sessions, notes) that Hermes writes into the
// localStorage mirrors the UI reads, then signal consumers to re-read. Runs on
// mount, every 60s, and on tab focus / visibility. Mounted once in the layout.
async function pull() {
  if (typeof window === "undefined") return;
  try {
    const [ss, nt] = await Promise.all([
      fetch("/api/study-sessions", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch("/api/notes?limit=100", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]);

    if (ss?.ok && Array.isArray(ss.data?.sessions)) {
      const json = JSON.stringify(ss.data.sessions);
      if (localStorage.getItem(STUDY_KEY) !== json) localStorage.setItem(STUDY_KEY, json);
    }
    if (nt?.ok && Array.isArray(nt.data?.notes)) {
      const json = JSON.stringify(nt.data.notes);
      if (localStorage.getItem(SERVER_NOTES_KEY) !== json) localStorage.setItem(SERVER_NOTES_KEY, json);
    }

    // Always pulse — assignment lists are pulled live from the API and want a
    // nudge to re-fetch too, even when the mirrors didn't change.
    dispatchDataRefresh();
  } catch {
    // network hiccups are non-fatal; the next interval/focus will retry
  }
}

export function ServerSync() {
  useEffect(() => {
    pull();
    const interval = setInterval(pull, 60000);
    const onFocus = () => pull();
    const onVisible = () => {
      if (document.visibilityState === "visible") pull();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return null;
}
