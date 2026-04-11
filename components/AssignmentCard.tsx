"use client";

import Link from "next/link";
import type { Assignment } from "@/lib/types";
import { getCourse, daysUntil, urgencyColor, formatShortDate, typeLabel } from "@/lib/data";

export function AssignmentCard({ a, showProgress = false }: { a: Assignment; showProgress?: boolean }) {
  const course = getCourse(a.courseId);
  const days = daysUntil(a.dueDate);
  const urgency = urgencyColor(days);
  const daysText = days < 0 ? `${Math.abs(days)}D LATE` : days === 0 ? "TODAY" : `${days}D`;

  return (
    <Link href={`/assignment/${a.id}`} className="card assign-card">
      <div className="dot" style={{ background: course?.color ?? "var(--accent)" }} />
      <div className="info">
        <div className="top-row">
          <span className="course">● {course?.shortName ?? "?"}</span>
          <span>{typeLabel(a.type)}</span>
        </div>
        <div className="title">{a.title}</div>
        <div className="meta">
          {formatShortDate(a.dueDate)} · {course?.professor ?? ""}
        </div>
        {showProgress && (
          <>
            <div className="progress-bar">
              <div className="fill" style={{ width: `${a.progress ?? 0}%` }} />
            </div>
            <div className="progress-meta">
              <span>{a.status.replace(/_/g, " ")}</span>
              <span>{days < 0 ? "OVERDUE" : `${days} DAYS`}</span>
            </div>
          </>
        )}
      </div>
      <div className={`days-pill ${urgency}`}>{daysText}</div>
    </Link>
  );
}
