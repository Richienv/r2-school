"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { AssignmentCard } from "@/components/AssignmentCard";
import { AddAssignmentSheet } from "@/components/AddAssignmentSheet";
import { loadAssignments, daysUntil, getCourse } from "@/lib/data";
import type { Assignment } from "@/lib/types";

export default function HomePage() {
  const [list, setList] = useState<Assignment[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    setList(loadAssignments());
    setMounted(true);
  }, []);

  const upcoming = useMemo(
    () =>
      [...list]
        .filter((a) => a.status !== "DONE" && a.status !== "SUBMITTED")
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 5),
    [list]
  );

  const urgent = upcoming.find((a) => {
    const d = daysUntil(a.dueDate);
    return d >= 0 && d <= 5;
  });

  const weekDays = useMemo(() => buildWeek(list), [list]);

  function refresh() {
    setList(loadAssignments());
    setShowAdd(false);
  }

  const urgentCourse = urgent ? getCourse(urgent.courseId) : null;

  return (
    <div className="screen">
      <Header />

      {/* Student + Urgent row */}
      <div className="info-row">
        <div className="info-left">
          <div className="info-name">Richie Kid Novell</div>
          <div className="info-meta">22520759 · GMBA · ZJU</div>
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

      {/* Week strip */}
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

      {/* Upcoming header */}
      <div className="upcoming-header">
        <span className="upcoming-label">UPCOMING</span>
        <button className="add-link" onClick={() => setShowAdd(true)}>+ ADD</button>
      </div>

      {/* Cards */}
      <div className="scroll-area" style={{ paddingBottom: 120 }}>
        {!mounted ? null : upcoming.length === 0 ? (
          <div className="empty" style={{ fontSize: 18, padding: "24px 16px" }}>NOTHING DUE.</div>
        ) : (
          upcoming.map((a) => <AssignmentCard key={a.id} a={a} />)
        )}
      </div>

      <BottomNav />
      {showAdd && <AddAssignmentSheet onClose={() => setShowAdd(false)} onSaved={refresh} />}
    </div>
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
