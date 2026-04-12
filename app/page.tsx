"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { AssignmentCard } from "@/components/AssignmentCard";
import { AddAssignmentSheet } from "@/components/AddAssignmentSheet";
import { loadAssignments, daysUntil } from "@/lib/data";
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

  return (
    <div className="screen">
      <Header />

      <div className="student-card">
        <div className="info">
          <div className="name">Richie Kid Novell</div>
          <div className="sid">22520759</div>
          <div className="program">GMBA · Zhejiang University</div>
        </div>
        <div className="badge">R2</div>
      </div>

      {urgent && mounted && (
        <Link href={`/assignment/${urgent.id}`} className="urgent-banner">
          ⚡ {urgent.title.toUpperCase()} — {daysUntil(urgent.dueDate)} DAYS
        </Link>
      )}

      <div className="week-section">
        <div className="label">THIS WEEK</div>
        <div className="week-strip">
          {weekDays.map((d) => (
            <div key={d.key} className={`week-day ${d.today ? "today" : ""}`}>
              <div className="wd">{d.label}</div>
              <div className="num">{d.num}</div>
              {d.count > 0 && <div className="due-dot" />}
            </div>
          ))}
        </div>
      </div>

      <div className="section-label">UPCOMING</div>

      <div className="scroll-area">
        {!mounted ? null : upcoming.length === 0 ? (
          <div className="empty">NOTHING DUE. ENJOY IT.</div>
        ) : (
          upcoming.map((a) => <AssignmentCard key={a.id} a={a} showProgress />)
        )}
        <button className="primary-btn" onClick={() => setShowAdd(true)}>+ ADD ASSIGNMENT</button>
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
  const dayOfWeek = now.getDay();
  start.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const count = list.filter((a) => a.dueDate === iso).length;
    const today = d.toDateString() === now.toDateString();
    return { key: iso, label: labels[i], num: d.getDate(), count, today };
  });
}
