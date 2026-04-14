"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { AddAssignmentSheet } from "@/components/AddAssignmentSheet";
import {
  getCourse,
  loadAssignments,
  daysUntil,
  daysDisplay,
  formatShortDate,
  typeLabel,
  loadCourseNote,
  saveCourseNote,
} from "@/lib/data";
import { useSettings } from "@/lib/settings";
import type { Assignment } from "@/lib/types";

export default function CourseDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const course = getCourse(params.id);
  const [list, setList] = useState<Assignment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const [settings] = useSettings();
  const threshold = settings.urgentThreshold;
  const profOverride = course ? settings.professors[course.id] : "";
  const profDisplay = profOverride ? `Prof. ${profOverride}` : (course?.professor ?? "");

  useEffect(() => {
    loadAssignments().then(setList);
    if (course) setNoteText(loadCourseNote(course.id));
  }, [course]);

  if (!course) {
    return (
      <div className="screen">
        <div className="empty">COURSE NOT FOUND</div>
        <BottomNav />
      </div>
    );
  }

  const items = list
    .filter((a) => a.courseId === course.id)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  async function refresh() {
    const l = await loadAssignments();
    setList(l);
    setShowAdd(false);
  }

  function saveNotes() {
    if (!course) return;
    saveCourseNote(course.id, noteText);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  }

  function jumpPractice(week: number) {
    router.push(`/learn?course=${course!.id}&week=${week}`);
  }

  const profUpper = profDisplay.replace(/^Prof\.?\s*/i, "").toUpperCase();

  return (
    <div className="screen" style={{ ["--course-color" as string]: course.color }}>
      <div className="cd-header">
        <Link href="/courses" className="cd-back">← COURSES</Link>
        <div className="cd-code">{course.shortName}</div>
        <div className="cd-name">{course.name}</div>
        <div className="cd-prof">{profUpper}</div>
      </div>

      <div className="scroll-area" style={{ padding: 0 }}>
        {/* Professor */}
        <div className="cd-section">
          <div className="cd-label">PROFESSOR</div>
          <div className="cd-prof-name">{profDisplay || "—"}</div>
          <div className="cd-prof-sub">{course.name}</div>
        </div>

        {/* Assignments */}
        <div className="cd-section">
          <div className="cd-head-row">
            <div className="cd-label-group">
              <span className="cd-label">ASSIGNMENTS</span>
              <span className="cd-count">{items.length}</span>
            </div>
            <button className="cd-add-btn" onClick={() => setShowAdd(true)}>+ ADD</button>
          </div>

          {items.length === 0 ? (
            <div className="empty" style={{ fontSize: 16, padding: "12px 0", textAlign: "left" }}>
              NOTHING YET.
              <div className="empty-sub">Tap + ADD to create one.</div>
            </div>
          ) : (
            <div className="grid-2x2">
              {items.map((a) => {
                const d = daysUntil(a.dueDate);
                const { label, variant } = daysDisplay(d, threshold);
                return (
                  <Link key={a.id} href={`/assignment/${a.id}`} className="g-card">
                    <span className="g-tag">{course.shortName}</span>
                    <div className="g-title">{a.title}</div>
                    <div className="g-foot">
                      <div className="g-meta">
                        {typeLabel(a.type)}
                        <br />
                        {formatShortDate(a.dueDate)}
                      </div>
                      <span className={`g-days ${variant}`}>{label}</span>
                    </div>
                    <div className="g-track">
                      <div className="g-fill" style={{ width: `${a.progress ?? 0}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Practice */}
        <div className="cd-section">
          <div className="cd-head-row">
            <span className="cd-label">PRACTICE THIS COURSE</span>
          </div>
          <div className="cd-week-pills">
            {Array.from({ length: 14 }).map((_, i) => (
              <button key={i} className="cd-wk" onClick={() => jumpPractice(i + 1)}>
                WK {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="cd-section">
          <div className="cd-head-row">
            <span className="cd-label">NOTES</span>
          </div>
          <textarea
            className="cd-notes"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add course notes..."
          />
          <div className="cd-save-row">
            <button className="cd-save" onClick={saveNotes}>
              {savedFlash ? "SAVED ✓" : "SAVE"}
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
      {showAdd && (
        <AddAssignmentSheet
          defaultCourseId={course.id}
          onClose={() => setShowAdd(false)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
