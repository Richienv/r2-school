"use client";

import Link from "next/link";
import type { Assignment } from "@/lib/types";
import { getCourse, daysUntil, formatShortDate, typeLabel } from "@/lib/data";

export function AssignmentCard({ a, showProgress = false }: { a: Assignment; showProgress?: boolean }) {
  const course = getCourse(a.courseId);
  const days = daysUntil(a.dueDate);
  const daysText = days < 0 ? `${Math.abs(days)}D LATE` : days === 0 ? "TODAY" : `${days}D`;
  const pillClass = days <= 3 ? "hot" : days <= 7 ? "warm" : "cool";

  return (
    <Link href={`/assignment/${a.id}`} className="card">
      <div className="assign-card">
        <div className="bar" style={{ background: course?.color ?? "var(--accent)" }} />
        <div className="info">
          <div className="course-label">● {course?.shortName ?? "?"}</div>
          <div className="title">{a.title}</div>
          <div className="meta">{typeLabel(a.type)} · {formatShortDate(a.dueDate)}</div>
          {showProgress && (
            <>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${a.progress ?? 0}%` }} />
              </div>
              <div className="progress-label">{a.status.replace(/_/g, " ")}</div>
            </>
          )}
        </div>
        <div className={`days-pill ${pillClass}`}>{daysText}</div>
      </div>
    </Link>
  );
}
