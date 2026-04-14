"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { AddAssignmentSheet } from "@/components/AddAssignmentSheet";
import { loadAssignments, syncLegacyAssignments, daysUntil, getCourse, formatShortDate, typeLabel, daysDisplay } from "@/lib/data";
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

  const visible = upcoming.slice(0, 4);
  const hasMore = upcoming.length > 4;

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

      <div className="grid-area">
        {!mounted ? null : visible.length === 0 ? (
          <div className="grid-empty">NOTHING DUE.</div>
        ) : (
          <>
            <div className="grid-2x2">
              {visible.map((a) => (
                <GridCard key={a.id} a={a} threshold={threshold} />
              ))}
            </div>
            {hasMore && (
              <Link href="/courses" className="view-all">
                VIEW ALL →
              </Link>
            )}
          </>
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

function GridCard({ a, threshold }: { a: Assignment; threshold: number }) {
  const course = getCourse(a.courseId);
  const d = daysUntil(a.dueDate);
  const { label, variant } = daysDisplay(d, threshold);
  return (
    <Link href={`/assignment/${a.id}`} className="g-card">
      <span className="g-tag">{course?.shortName ?? "—"}</span>
      <div className="g-title">{a.title}</div>
      <div className="g-foot">
        <div className="g-meta">
          {typeLabel(a.type)}
          <br />
          {formatShortDate(a.dueDate)}
        </div>
        <span className={`g-days ${variant}`}>{label}</span>
      </div>
      <div className="g-track">
        <div className="g-fill" style={{ width: `${a.progress ?? 0}%` }} />
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
