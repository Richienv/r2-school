"use client";

import { useEffect, useRef } from "react";

// Fired whenever ServerSync has pulled fresh server data into localStorage.
export const DATA_EVENT = "r2school:data";

// localStorage mirrors of server-owned data that Hermes writes.
export const STUDY_KEY = "r2school.studysessions.v1";
export const SERVER_NOTES_KEY = "r2school.servernotes.v1";

const MIN_INTERVAL_MS = 1500;

export function dispatchDataRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DATA_EVENT));
}

// Subscribe a re-read callback to soft-refresh pulses. Guards: never within
// 1.5s of the previous run, never while the user is typing in a field.
// NEVER triggers window.location.reload() — that was R2·FIT's original sin.
export function useSoftRefresh(onRefresh: () => void) {
  const last = useRef(0);
  const cb = useRef(onRefresh);
  cb.current = onRefresh;

  useEffect(() => {
    const handler = () => {
      const now = Date.now();
      if (now - last.current < MIN_INTERVAL_MS) return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || !!el?.isContentEditable;
      if (typing) return;
      last.current = now;
      cb.current();
    };
    window.addEventListener(DATA_EVENT, handler);
    return () => window.removeEventListener(DATA_EVENT, handler);
  }, []);
}
