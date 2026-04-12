"use client";

import { useEffect, useMemo, useState } from "react";
import { HeaderBig } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { AssignmentCard } from "@/components/AssignmentCard";
import { COURSES, loadAssignments, daysUntil } from "@/lib/data";
import type { Assignment } from "@/lib/types";

export default function TimelinePage() {
  const [list, setList] = useState<Assignment[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setList(loadAssignments());
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    let l = [...list].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    if (filter !== "ALL") l = l.filter((a) => a.courseId === filter);
    return l;
  }, [list, filter]);

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

  return (
    <div className="screen">
      <HeaderBig title="TIMELINE" />

      <div className="filter-pills">
        <button className={`pill ${filter === "ALL" ? "active" : ""}`} onClick={() => setFilter("ALL")}>ALL</button>
        {COURSES.map((c) => (
          <button key={c.id} className={`pill ${filter === c.id ? "active" : ""}`} onClick={() => setFilter(c.id)}>
            {c.shortName}
          </button>
        ))}
      </div>

      <div className="scroll-area">
        {!mounted ? null : filtered.length === 0 ? (
          <div className="empty">NO ASSIGNMENTS MATCH</div>
        ) : (
          groupOrder.map((g) =>
            grouped[g]?.length ? (
              <div key={g}>
                <div className="week-group-label">{g}</div>
                {grouped[g].map((a) => <AssignmentCard key={a.id} a={a} showProgress />)}
              </div>
            ) : null
          )
        )}
      </div>

      <BottomNav />
    </div>
  );
}
