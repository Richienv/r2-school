"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { AssignmentCard } from "@/components/AssignmentCard";
import { COURSES, loadAssignments, daysUntil } from "@/lib/data";
import type { Assignment } from "@/lib/types";

type View = "WEEK" | "MONTH" | "ALL";

export default function TimelinePage() {
  const [list, setList] = useState<Assignment[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [view, setView] = useState<View>("ALL");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setList(loadAssignments());
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    let l = [...list].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    if (filter !== "ALL") l = l.filter((a) => a.courseId === filter);
    if (view === "WEEK") l = l.filter((a) => daysUntil(a.dueDate) <= 7 && daysUntil(a.dueDate) >= -7);
    if (view === "MONTH") l = l.filter((a) => daysUntil(a.dueDate) <= 30 && daysUntil(a.dueDate) >= -7);
    return l;
  }, [list, filter, view]);

  const grouped = useMemo(() => {
    const groups: Record<string, Assignment[]> = {};
    for (const a of filtered) {
      const d = daysUntil(a.dueDate);
      let key = "LATER";
      if (d < 0) key = "OVERDUE";
      else if (d <= 7) key = "THIS WEEK";
      else if (d <= 14) key = "NEXT WEEK";
      else if (d <= 30) key = "THIS MONTH";
      (groups[key] = groups[key] || []).push(a);
    }
    return groups;
  }, [filtered]);

  const groupOrder = ["OVERDUE", "THIS WEEK", "NEXT WEEK", "THIS MONTH", "LATER"];

  const now = new Date();
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const monthLabel = `${months[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="screen">
      <div className="header">
        <div>
          <div className="logo" style={{ fontSize: 18 }}>TIMELINE</div>
          <div className="date" style={{ marginTop: 2 }}>{monthLabel}</div>
        </div>
        <div className="flex-row">
          {(["WEEK", "MONTH", "ALL"] as View[]).map((v) => (
            <button key={v} className={`pill ${view === v ? "active" : ""}`} onClick={() => setView(v)}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-pills">
        <button className={`pill ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>ALL</button>
        {COURSES.map((c) => (
          <button
            key={c.id}
            className={`pill ${filter === c.id ? "active" : ""}`}
            onClick={() => setFilter(c.id)}
          >
            {c.shortName}
          </button>
        ))}
      </div>

      <div className="scroll-list">
        {!mounted ? null : filtered.length === 0 ? (
          <div className="empty">NO ASSIGNMENTS MATCH</div>
        ) : (
          groupOrder.map((g) =>
            grouped[g] && grouped[g].length > 0 ? (
              <div key={g}>
                <div className="week-group-label">{g}</div>
                {grouped[g].map((a) => (
                  <AssignmentCard key={a.id} a={a} showProgress />
                ))}
              </div>
            ) : null
          )
        )}
      </div>

      <BottomNav />
    </div>
  );
}
