"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { AssignmentCard } from "@/components/AssignmentCard";
import { AddAssignmentSheet } from "@/components/AddAssignmentSheet";
import { getCourse, loadAssignments, loadNotes, daysUntil } from "@/lib/data";
import type { Assignment, ClassNote } from "@/lib/types";

export default function CourseDetail() {
  const params = useParams<{ id: string }>();
  const course = getCourse(params.id);
  const [list, setList] = useState<Assignment[]>([]);
  const [notes, setNotes] = useState<ClassNote[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    setList(loadAssignments());
    setNotes(loadNotes());
  }, []);

  if (!course) return <div className="empty">COURSE NOT FOUND</div>;

  const courseAssignments = list
    .filter((a) => a.courseId === course.id)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const upcoming = courseAssignments.filter((a) => a.status !== "DONE" && daysUntil(a.dueDate) >= 0).length;
  const overdue = courseAssignments.filter((a) => daysUntil(a.dueDate) < 0 && a.status !== "DONE").length;
  const done = courseAssignments.filter((a) => a.status === "DONE").length;
  const courseNotes = notes.filter((n) => n.courseId === course.id).slice(0, 3);

  function refresh() {
    setList(loadAssignments());
    setShowAdd(false);
  }

  return (
    <div className="screen">
      <Link href="/courses" className="back-link">← COURSES</Link>
      <div className="detail-head">
        <div className="title" style={{ fontFamily: "var(--display)", fontSize: 48, color: course.color }}>{course.shortName}</div>
        <div className="meta" style={{ marginTop: 4 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: 2, color: "var(--text-dim)" }}>{course.name.toUpperCase()}</span>
        </div>
        <div className="meta" style={{ marginTop: 4 }}>
          <span>{course.professor}</span>
        </div>
      </div>

      <div className="stats-pills">
        <div className="stat-pill">{upcoming} UPCOMING</div>
        <div className="stat-pill" style={overdue > 0 ? { color: "var(--danger)" } : {}}>{overdue} OVERDUE</div>
        <div className="stat-pill">{done} DONE</div>
      </div>

      <div className="scroll-area">
        {courseAssignments.length === 0 ? (
          <div className="empty">
            NO ASSIGNMENTS YET.<br />ADD YOUR FIRST ONE.
          </div>
        ) : (
          courseAssignments.map((a) => <AssignmentCard key={a.id} a={a} showProgress />)
        )}

        {courseNotes.length > 0 && (
          <>
            <div className="label" style={{ margin: "20px 0 10px" }}>RECENT NOTES</div>
            {courseNotes.map((n) => (
              <div key={n.id} className="card" style={{ padding: 14 }}>
                <div className="label">{n.date}</div>
                <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-dim)" }}>{n.rawContent.slice(0, 120)}...</div>
              </div>
            ))}
          </>
        )}

        <button className="primary-btn" onClick={() => setShowAdd(true)}>+ ADD ASSIGNMENT</button>
        <Link href={`/catchup?course=${course.id}`} className="ghost-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 10 }}>
          ✦ CATCH UP
        </Link>
      </div>

      <BottomNav />
      {showAdd && <AddAssignmentSheet defaultCourseId={course.id} onClose={() => setShowAdd(false)} onSaved={refresh} />}
    </div>
  );
}
