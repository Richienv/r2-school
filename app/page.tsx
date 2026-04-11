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

  const urgent = upcoming.find((a) => daysUntil(a.dueDate) <= 3 && daysUntil(a.dueDate) >= 0);

  const weekDays = useMemo(() => buildWeek(list), [list]);

  function refresh() {
    setList(loadAssignments());
    setShowAdd(false);
  }

  return (
    <div className="screen">
      <Header />
      {urgent && mounted && (
        <Link href={`/assignment/${urgent.id}`} className="urgent-banner">
          ⚠ {urgent.title.toUpperCase()} — {daysUntil(urgent.dueDate)} DAYS LEFT
        </Link>
      )}

      <div className="week-strip">
        {weekDays.map((d) => (
          <div key={d.key} className={`week-day ${d.today ? "today" : ""}`}>
            <div className="wd">{d.label}</div>
            <div className="num">{d.num}</div>
            {d.count > 0 && <div className="dot" />}
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-title">UPCOMING</div>
      </div>

      <div className="scroll-list">
        {!mounted ? null : upcoming.length === 0 ? (
          <div className="empty">NOTHING DUE. ENJOY IT.</div>
        ) : (
          upcoming.map((a) => <AssignmentCard key={a.id} a={a} />)
        )}
      </div>

      <div className="quick-actions">
        <Link href="/courses" className="quick-btn">
          <span className="icon">▦</span>
          <span>COURSES</span>
        </Link>
        <button className="quick-btn primary" onClick={() => setShowAdd(true)}>
          <span className="icon">+</span>
          <span>ADD TASK</span>
        </button>
        <Link href="/catchup" className="quick-btn yellow">
          <span className="icon">✦</span>
          <span>CATCH UP</span>
        </Link>
      </div>

      <BottomNav />

      {showAdd && <AddAssignmentSheet onClose={() => setShowAdd(false)} onSaved={refresh} />}
    </div>
  );
}

function buildWeek(list: Assignment[]) {
  const labels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1);
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const label = labels[(i + 1) % 7];
    const count = list.filter((a) => a.dueDate === iso).length;
    const today = d.toDateString() === now.toDateString();
    return { key: iso, label, num: d.getDate(), count, today };
  });
}
