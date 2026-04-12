"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { AssignmentCard } from "@/components/AssignmentCard";
import { AddAssignmentSheet } from "@/components/AddAssignmentSheet";
import { getCourse, loadAssignments, daysUntil } from "@/lib/data";
import type { Assignment } from "@/lib/types";

export default function CourseDetail() {
  const params = useParams<{ id: string }>();
  const course = getCourse(params.id);
  const [list, setList] = useState<Assignment[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => setList(loadAssignments()), []);

  if (!course) return <div className="screen"><div className="empty">COURSE NOT FOUND</div><BottomNav /></div>;

  const items = list.filter((a) => a.courseId === course.id).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const upcoming = items.filter((a) => a.status !== "DONE" && daysUntil(a.dueDate) >= 0).length;
  const overdue = items.filter((a) => daysUntil(a.dueDate) < 0 && a.status !== "DONE").length;
  const done = items.filter((a) => a.status === "DONE").length;

  function refresh() {
    setList(loadAssignments());
    setShowAdd(false);
  }

  return (
    <div className="screen">
      <Link href="/courses" className="back-link">← COURSES</Link>
      <div className="detail-head">
        <div className="title" style={{ fontSize: 52 }}>{course.shortName}</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 2, color: "var(--text-dim)", marginTop: 4 }}>
          {course.name.toUpperCase()}
        </div>
        <div className="meta" style={{ marginTop: 4 }}>
          <span style={{ color: "var(--text-dim)" }}>{course.professor}</span>
        </div>
      </div>

      <div className="stats-pills">
        <div className="stat-pill">{upcoming} UPCOMING</div>
        <div className="stat-pill">{overdue} OVERDUE</div>
        <div className="stat-pill">{done} DONE</div>
      </div>

      <div className="scroll-area">
        {items.length === 0 ? (
          <div className="empty">NO ASSIGNMENTS.<div className="empty-sub">Add your first.</div></div>
        ) : (
          items.map((a) => <AssignmentCard key={a.id} a={a} showProgress />)
        )}
        <button className="primary-btn" onClick={() => setShowAdd(true)}>+ ADD ASSIGNMENT</button>
        <Link href={`/catchup?course=${course.id}`} className="ghost-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          CATCH UP
        </Link>
      </div>

      <BottomNav />
      {showAdd && <AddAssignmentSheet defaultCourseId={course.id} onClose={() => setShowAdd(false)} onSaved={refresh} />}
    </div>
  );
}
