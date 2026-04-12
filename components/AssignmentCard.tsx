"use client";

import Link from "next/link";
import type { Assignment } from "@/lib/types";
import { getCourse, daysUntil, formatShortDate, typeLabel } from "@/lib/data";

export function AssignmentCard({ a }: { a: Assignment }) {
  const course = getCourse(a.courseId);
  const days = daysUntil(a.dueDate);
  const daysText = days < 0 ? `${Math.abs(days)}D LATE` : days === 0 ? "TODAY" : `${days}D`;
  const pillClass = days <= 3 ? "hot" : days <= 7 ? "warm" : "cool";

  return (
    <Link href={`/assignment/${a.id}`} className="c-card">
      <div className="c-bar" />
      <div className="c-body">
        <div className="c-row1">
          <span className="c-course"><span className="c-dot" />  {course?.shortName ?? "?"}</span>
          <span className="c-title">{a.title}</span>
          <span className={`c-days ${pillClass}`}>{daysText}</span>
        </div>
        <div className="c-row2">{typeLabel(a.type)} · {formatShortDate(a.dueDate)}</div>
        <div className="c-row3">
          <div className="c-track"><div className="c-fill" style={{ width: `${a.progress ?? 0}%` }} /></div>
          <span className="c-status">{a.status.replace(/_/g, " ")}</span>
        </div>
      </div>
    </Link>
  );
}
