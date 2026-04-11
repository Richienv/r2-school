"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { COURSES, loadAssignments, daysUntil } from "@/lib/data";
import type { Assignment } from "@/lib/types";

export default function CoursesPage() {
  const [list, setList] = useState<Assignment[]>([]);
  useEffect(() => setList(loadAssignments()), []);

  return (
    <div className="screen">
      <Header title="COURSES" />
      <div className="course-grid">
        {COURSES.map((c) => {
          const courseItems = list.filter((a) => a.courseId === c.id);
          const upcoming = courseItems.filter((a) => a.status !== "DONE" && daysUntil(a.dueDate) >= 0).length;
          const overdue = courseItems.filter((a) => daysUntil(a.dueDate) < 0 && a.status !== "DONE").length;
          return (
            <Link key={c.id} href={`/courses/${c.id}`} className="course-card">
              <div className="accent-dot" style={{ background: c.color }} />
              <div>
                <div className="short" style={{ color: c.color }}>{c.shortName}</div>
                <div className="full">{c.name.toUpperCase()}</div>
                <div className="prof">{c.professor}</div>
              </div>
              <div className="stats">
                <span>{upcoming} upcoming · {overdue} overdue</span>
                <span>›</span>
              </div>
            </Link>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
}
