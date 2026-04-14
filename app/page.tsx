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
  const [settings] = useSettings();
  const threshold = settings.urgentThreshold;

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

  const urgent = upcoming.find((a) => {
    const d = daysUntil(a.dueDate);
    return d >= 0 && d <= threshold;
  });

  const weekDays = useMemo(() => buildWeek(list), [list]);

  async function refresh() {
    const list = await loadAssignments();
    setList(list);
    setShowAdd(false);
  }

  const urgentCourse = urgent ? getCourse(urgent.courseId) : null;

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
        <div className="info-right">
          {urgent && mounted ? (
            <Link href={`/assignment/${urgent.id}`} className="urgent-pill">
              ⚡ {urgentCourse?.shortName} · {daysUntil(urgent.dueDate)}D
            </Link>
          ) : (
            <span className="all-clear">ALL CLEAR</span>
          )}
        </div>
      </div>

      <div className="week-row">
        <span className="week-label">WEEK</span>
        <div className="week-pills">
          {weekDays.map((d) => (
            <div key={d.key} className={`wp ${d.today ? "today" : ""}`}>
              <span className="wp-letter">{d.label}</span>
              <span className="wp-num">{d.num}</span>
              {d.count > 0 && <span className="wp-dot" />}
            </div>
          ))}
        </div>
      </div>

      <div className="upcoming-header">
        <span className="upcoming-label">UPCOMING</span>
      </div>

      <div className="tl-area">
        {!mounted ? null : upcoming.length === 0 ? (
          <div className="grid-empty">NOTHING DUE.</div>
        ) : (
          <div className="tl-list">
            {upcoming.map((a) => (
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
