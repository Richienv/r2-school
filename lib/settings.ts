"use client";

import { useEffect, useState } from "react";

export type WeekFormat = "WK" | "Week";
export type DateFormat = "MMM DD" | "DD MMM" | "MM/DD";

export interface Profile {
  name: string;
  studentId: string;
  program: string;
  university: string;
}

export interface Settings {
  timezone: string;
  semesterStart: string;
  semesterEnd: string;
  urgentThreshold: number;
  weekFormat: WeekFormat;
  dateFormat: DateFormat;
  profile: Profile;
  professors: Record<string, string>;
}

export const DEFAULT_SETTINGS: Settings = {
  timezone: "Asia/Shanghai",
  semesterStart: "2026-02-24",
  semesterEnd: "2026-06-30",
  urgentThreshold: 3,
  weekFormat: "WK",
  dateFormat: "MMM DD",
  profile: {
    name: "Richie Kid Novell",
    studentId: "22520759",
    program: "GMBA",
    university: "Zhejiang University",
  },
  professors: {
    ib: "Simon Collinson",
    sm: "",
    innovation: "Wenjing Lyu",
    blockchain: "",
    ai: "",
    chinese: "",
  },
};

export const TIMEZONES: { id: string; label: string }[] = [
  { id: "Asia/Shanghai", label: "Asia/Shanghai · UTC+8" },
  { id: "Asia/Jakarta", label: "Asia/Jakarta · UTC+7" },
  { id: "Asia/Singapore", label: "Asia/Singapore · UTC+8" },
  { id: "America/New_York", label: "America/New_York · EST/EDT" },
  { id: "Europe/London", label: "Europe/London · GMT/BST" },
  { id: "UTC", label: "UTC · UTC+0" },
];

const KEY = "r2school_settings";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getSettings(): Settings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      profile: { ...DEFAULT_SETTINGS.profile, ...(parsed.profile ?? {}) },
      professors: { ...DEFAULT_SETTINGS.professors, ...(parsed.professors ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(partial: Partial<Settings>) {
  if (!isBrowser()) return;
  const current = getSettings();
  const next: Settings = {
    ...current,
    ...partial,
    profile: { ...current.profile, ...(partial.profile ?? {}) },
    professors: { ...current.professors, ...(partial.professors ?? {}) },
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent("r2school:settings", { detail: next }));
  }
}

export function useSettings(): [Settings, (p: Partial<Settings>) => void] {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getSettings());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Settings>).detail;
      if (detail) setSettings(detail);
    };
    window.addEventListener("r2school:settings", handler);
    return () => window.removeEventListener("r2school:settings", handler);
  }, []);

  function update(p: Partial<Settings>) {
    saveSettings(p);
    setSettings(getSettings());
  }

  return [settings, update];
}

export function formatDateInTz(iso: string, tz: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).toUpperCase();
  } catch {
    return iso;
  }
}

export function todayInTz(tz: string): string {
  try {
    return new Date().toLocaleDateString("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).toUpperCase();
  } catch {
    return new Date().toDateString().toUpperCase();
  }
}
