"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { AssignmentCard } from "@/components/AssignmentCard";
import { AddAssignmentSheet } from "@/components/AddAssignmentSheet";
import { getCourse, loadAssignments, loadNotes } from "@/lib/data";
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

  const courseNotes = notes.filter((n) => n.courseId === course.id).slice(0, 3);

  function refresh() {
    setList(loadAssignments());
    setShowAdd(false);
  }

  return (
    <div className="screen">
      <Link href="/courses" className="back-link">← COURSES</Link>
      <div className="detail-head" style={{ borderLeft: `3px solid ${course.color}` }}>
        <div className="type-badge" style={{ color: course.color }}>{course.shortName}</div>
        <div className="title">{course.name}</div>
        <div className="meta"><span>{course.professor}</span></div>
      </div>

      <div className="scroll-list">
        <div className="section-title" style={{ marginTop: 16 }}>ASSIGNMENTS</div>
        {courseAssignments.length === 0 ? (
          <div className="empty">NO ASSIGNMENTS YET</div>
        ) : (
          courseAssignments.map((a) => <AssignmentCard key={a.id} a={a} showProgress />)
        )}

        <div className="section-title" style={{ marginTop: 24 }}>RECENT NOTES</div>
        {courseNotes.length === 0 ? (
          <div className="empty">NO NOTES SAVED</div>
        ) : (
          courseNotes.map((n) => (
            <div key={n.id} className="card">
              <div className="label">{n.date}</div>
              <div style={{ marginTop: 8, fontSize: 13 }}>{n.aiSummary}</div>
            </div>
          ))
        )}

        <button className="primary-btn" onClick={() => setShowAdd(true)}>+ ADD ASSIGNMENT</button>
        <Link href={`/catchup?course=${course.id}`} className="primary-btn yellow" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
          ✦ CATCH UP
        </Link>
      </div>

      <BottomNav />
      {showAdd && <AddAssignmentSheet defaultCourseId={course.id} onClose={() => setShowAdd(false)} onSaved={refresh} />}
    </div>
  );
}
