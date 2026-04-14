"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { AddAssignmentSheet } from "@/components/AddAssignmentSheet";
import { loadAssignments, syncLegacyAssignments, daysUntil, getCourse, formatShortDate, typeLabel } from "@/lib/data";
import { useSettings } from "@/lib/settings";
import type { Assignment } from "@/lib/types";

export default function HomePage() {
  const [list, setList] = useState<Assignment[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [monthAnchor, setMonthAnchor] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [settings] = useSettings();

  useEffect(() => {
    (async () => {
      await syncLegacyAssignments();
      const list = await loadAssignments();
      setList(list);
      setMounted(true);
    })();
  }, []);

  const upcoming = useMemo(
    () =>
      [...list]
        .filter((a) => a.status !== "DONE" && a.status !== "SUBMITTED")
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [list]
  );

  useEffect(() => {
    if (!mounted || selectedDate !== null || upcoming.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const hasToday = upcoming.some((a) => a.dueDate === today);
    const nearest = upcoming.find((a) => a.dueDate >= today) ?? upcoming[0];
    setSelectedDate(hasToday ? today : nearest.dueDate);
  }, [mounted, upcoming, selectedDate]);

  const weekDays = useMemo(() => buildWeek(list), [list]);

  const monthGrid = useMemo(() => buildMonth(monthAnchor, list), [monthAnchor, list]);

  const filtered = useMemo(() => {
    if (showAll) return upcoming;
    if (!selectedDate) return [];
    return upcoming.filter((a) => a.dueDate === selectedDate);
  }, [upcoming, selectedDate, showAll]);

  async function refresh() {
    const list = await loadAssignments();
    setList(list);
    setShowAdd(false);
  }

  function pickDate(iso: string) {
    setShowAll(false);
    setSelectedDate(iso);
  }

  function toggleAll() {
    setShowAll((v) => !v);
  }

  function shiftMonth(delta: number) {
    const [y, m] = monthAnchor.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonthAnchor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return (
    <div className="screen">
      <Header />

      <div className="info-row">
        <div className="info-left">
          <div className="info-name">{settings.profile.name}</div>
          <div className="info-meta">
            {settings.profile.studentId} · {settings.profile.program} · {shortUni(settings.profile.university)}
          </div>
        </div>
      </div>

      <div className="week-row">
        <button
          type="button"
          className="week-label week-toggle"
          onClick={() => setMonthOpen((v) => !v)}
          aria-expanded={monthOpen}
        >
          {monthOpen ? "MONTH ▴" : "WEEK ▾"}
        </button>
        <div className="week-pills">
          {weekDays.map((d) => {
            const selected = !showAll && selectedDate === d.key;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => pickDate(d.key)}
                className={`wp ${selected ? "today" : ""}`}
              >
                <span className="wp-letter">{d.label}</span>
                <span className="wp-num">{d.num}</span>
                {d.count > 0 && <span className="wp-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      {monthOpen && (
        <div className="month-panel">
          <div className="month-nav">
            <button type="button" className="month-nav-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">←</button>
            <span className="month-title">{formatMonthTitle(monthAnchor)}</span>
            <button type="button" className="month-nav-btn" onClick={() => shiftMonth(1)} aria-label="Next month">→</button>
          </div>
          <div className="month-dow">
            {["M", "T", "W", "T", "F", "S", "S"].map((l, i) => (
              <span key={i} className="month-dow-cell">{l}</span>
            ))}
          </div>
          <div className="month-grid">
            {monthGrid.map((cell, i) => {
              if (!cell) return <span key={i} className="mc mc-empty" />;
              const selected = !showAll && selectedDate === cell.key;
              const shown = cell.items.slice(0, 2);
              const extra = cell.items.length - shown.length;
              return (
                <button
                  key={cell.key}
                  type="button"
                  className={`mc ${cell.today ? "today" : ""} ${selected ? "selected" : ""} ${cell.items.length > 0 ? "has-items" : ""}`}
                  onClick={() => {
                    pickDate(cell.key);
                    setMonthOpen(false);
                  }}
                >
                  <span className="mc-num">{cell.num}</span>
                  {shown.length > 0 && (
                    <div className="mc-items">
                      {shown.map((a) => {
                        const c = getCourse(a.courseId);
                        return (
                          <div key={a.id} className="mc-item">
                            <span className="mc-code" style={{ color: c?.color ?? "#888" }}>
                              {c?.shortName ?? "—"}
                            </span>
                            <span className="mc-type">{shortTypeLabel(a.type)}</span>
                          </div>
                        );
                      })}
                      {extra > 0 && <div className="mc-more">+{extra}</div>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="upcoming-header">
        <span className="upcoming-label">
          {showAll ? "ALL UPCOMING" : selectedDate ? formatHeaderDate(selectedDate) : "UPCOMING"}
        </span>
        <button type="button" className="all-toggle" onClick={toggleAll}>
          {showAll ? "← BACK" : "ALL →"}
        </button>
      </div>

      <div className="tl-area">
        {!mounted ? null : filtered.length === 0 ? (
          <div className="tl-empty">
            <div className="tl-empty-main">NOTHING DUE.</div>
            <div className="tl-empty-sub">tap another date or view all</div>
          </div>
        ) : (
          <div className="tl-list">
            {filtered.map((a) => (
              <TimelineRow key={a.id} a={a} />
            ))}
          </div>
        )}
      </div>

      <button
        className="fab"
        aria-label="Add assignment"
        onClick={() => setShowAdd(true)}
      >
        +
      </button>

      <BottomNav />
      {showAdd && <AddAssignmentSheet onClose={() => setShowAdd(false)} onSaved={refresh} />}
    </div>
  );
}

function shortUni(name: string): string {
  const m = name.match(/\b([A-Z])/g);
  return m ? m.join("") : name.slice(0, 4).toUpperCase();
}

function formatHeaderDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  return `${weekdays[d.getDay()]} · ${months[d.getMonth()]} ${d.getDate()}`;
}

function TimelineRow({ a }: { a: Assignment }) {
  const course = getCourse(a.courseId);
  const d = daysUntil(a.dueDate);
  const daysLabel = d < 0 ? `${d}D` : d === 0 ? "TODAY" : `${d}D`;
  const daysVariant = d <= 1 ? "urgent" : d <= 3 ? "warn" : "cool";
  const statusLabel = a.status.replace(/_/g, " ");
  return (
    <Link href={`/assignment/${a.id}`} className="tl-row">
      <div className={`tl-days ${daysVariant}`}>{daysLabel}</div>
      <div className="tl-body">
        <div className="tl-code" style={{ color: course?.color ?? "#888" }}>
          {course?.shortName ?? "—"}
        </div>
        <div className="tl-title">{a.title}</div>
        <div className="tl-meta">
          {typeLabel(a.type)} · {formatShortDate(a.dueDate)}
        </div>
        <div className="tl-progress">
          <div className="tl-track">
            <div className="tl-fill" style={{ width: `${a.progress ?? 0}%` }} />
          </div>
          <span className="tl-status">{statusLabel}</span>
        </div>
      </div>
    </Link>
  );
}

function formatMonthTitle(anchor: string): string {
  const [y, m] = anchor.split("-").map(Number);
  const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  return `${months[m - 1]} ${y}`;
}

type MonthCell = { key: string; num: number; items: Assignment[]; today: boolean } | null;

function buildMonth(anchor: string, list: Assignment[]): MonthCell[] {
  const [y, m] = anchor.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const now = new Date();
  const leading = (first.getDay() + 6) % 7;
  const cells: MonthCell[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let day = 1; day <= last.getDate(); day++) {
    const d = new Date(y, m - 1, day);
    const iso = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const items = list.filter((a) => a.dueDate === iso && a.status !== "DONE" && a.status !== "SUBMITTED");
    const today = d.toDateString() === now.toDateString();
    cells.push({ key: iso, num: day, items, today });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function shortTypeLabel(t: string): string {
  const map: Record<string, string> = {
    GROUP_PRESENTATION: "Group Pres",
    INDIVIDUAL_PRESENTATION: "Ind Pres",
    INDIVIDUAL_PROJECT: "Ind Project",
    HOMEWORK: "Homework",
    MIDTERM: "Midterm",
    FINAL: "Final",
    EXAM: "Exam",
    QUIZ: "Quiz",
    MEETING: "Meeting",
    PREPARATION: "Prep",
  };
  return map[t] ?? t.replace(/_/g, " ");
}

function buildWeek(list: Assignment[]) {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const count = list.filter((a) => a.dueDate === iso).length;
    const today = d.toDateString() === now.toDateString();
    return { key: iso, label: labels[i], num: d.getDate(), count, today };
  });
}
