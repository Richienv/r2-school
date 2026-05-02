"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { AddAssignmentSheet } from "@/components/AddAssignmentSheet";
import { CourseSheet } from "@/components/CourseSheet";
import { GradeSheet } from "@/components/GradeSheet";
import {
  loadAssignments,
  daysUntil,
  daysDisplay,
  formatShortDate,
  typeLabel,
  loadCourseNote,
  saveCourseNote,
} from "@/lib/data";
import { useCourses, getCourseById } from "@/lib/courses";
import { useGrades, summarizeGrades, deleteGradesForCourse } from "@/lib/grades";
import { useSettings } from "@/lib/settings";
import type { Assignment, Course, Grade } from "@/lib/types";

export default function CourseDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [courses, courseActions] = useCourses();
  const course: Course | undefined = courses.find((c) => c.id === params.id) ?? getCourseById(params.id);
  const [list, setList] = useState<Assignment[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [editGrade, setEditGrade] = useState<Grade | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const [settings] = useSettings();
  const [grades] = useGrades(course?.id);
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

  function deleteCourseFully() {
    if (!course) return;
    deleteGradesForCourse(course.id);
    courseActions.remove(course.id);
    router.push("/courses");
  }

  const profUpper = profDisplay.replace(/^Prof\.?\s*/i, "").toUpperCase();
  const summary = summarizeGrades(grades);
  const earnedPct = summary.weightTotal > 0
    ? Math.round((summary.earned / summary.weightTotal) * 100)
    : 0;
  const gradedAvgPct = summary.weightUsed > 0
    ? Math.round((summary.earned / summary.weightUsed) * 100)
    : 0;

  return (
    <div className="screen" style={{ ["--course-color" as string]: course.color }}>
      <div className="cd-header">
        <div className="cd-top-row">
          <Link href="/courses" className="cd-back">← COURSES</Link>
          <button className="cd-edit-btn" onClick={() => setShowEditCourse(true)}>EDIT</button>
        </div>
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

        {/* Grades */}
        <div className="cd-section">
          <div className="cd-head-row">
            <div className="cd-label-group">
              <span className="cd-label">GRADES</span>
              <span className="cd-count">{grades.length}</span>
            </div>
            <button className="cd-add-btn" onClick={() => setShowAddGrade(true)}>+ ADD</button>
          </div>

          {grades.length === 0 ? (
            <div className="empty" style={{ fontSize: 16, padding: "12px 0", textAlign: "left" }}>
              NO GRADES YET.
              <div className="empty-sub">Tap + ADD to track a graded component.</div>
            </div>
          ) : (
            <>
              <div className="grade-summary">
                <div className="grade-summary-main">
                  <span className="grade-summary-pct">{earnedPct}%</span>
                  <span className="grade-summary-label">EARNED OF FINAL</span>
                </div>
                {summary.hasScores && (
                  <div className="grade-summary-sub">
                    AVG ON GRADED: <strong>{gradedAvgPct}%</strong>
                    {" · "}
                    {summary.weightUsed}/{summary.weightTotal} WEIGHT GRADED
                  </div>
                )}
                <div className="grade-summary-track">
                  <div
                    className="grade-summary-fill"
                    style={{ width: `${Math.min(100, summary.weightTotal)}%` }}
                  />
                </div>
                <div className="grade-summary-foot">
                  WEIGHT TRACKED: {summary.weightTotal}%
                  {summary.weightTotal !== 100 && summary.weightTotal > 0 && (
                    <span className="grade-summary-warn">
                      {" "}· {summary.weightTotal > 100 ? "OVER 100%" : `${100 - summary.weightTotal}% LEFT`}
                    </span>
                  )}
                </div>
              </div>

              <div className="grade-list">
                {grades.map((g) => {
                  const hasScore = g.score !== null && g.score !== undefined;
                  return (
                    <button
                      key={g.id}
                      className="grade-row"
                      onClick={() => setEditGrade(g)}
                    >
                      <div className="grade-row-left">
                        <div className="grade-row-label">{g.label}</div>
                        <div className="grade-row-meta">{g.weight}% OF FINAL</div>
                      </div>
                      <div className="grade-row-right">
                        {hasScore ? (
                          <span className="grade-score">{g.score}%</span>
                        ) : (
                          <span className="grade-score grade-score-pending">—</span>
                        )}
                        <span className="grade-chev">›</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
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

        {/* Danger */}
        <div className="cd-section">
          <button className="cd-delete-btn" onClick={() => setConfirmDelete(true)}>
            DELETE COURSE
          </button>
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
      {showEditCourse && (
        <CourseSheet
          existing={course}
          onClose={() => setShowEditCourse(false)}
          onSaved={() => setShowEditCourse(false)}
        />
      )}
      {showAddGrade && (
        <GradeSheet
          courseId={course.id}
          onClose={() => setShowAddGrade(false)}
          onSaved={() => setShowAddGrade(false)}
        />
      )}
      {editGrade && (
        <GradeSheet
          courseId={course.id}
          existing={editGrade}
          onClose={() => setEditGrade(null)}
          onSaved={() => setEditGrade(null)}
        />
      )}
      {confirmDelete && (
        <div className="sheet-backdrop" onClick={() => setConfirmDelete(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="drag-handle" />
            <div className="sheet-title">DELETE {course.shortName}?</div>
            <div style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 20 }}>
              Removes the course and its grades. Assignments are kept.
            </div>
            <div className="sheet-actions">
              <button className="ghost-btn" style={{ marginTop: 0 }} onClick={() => setConfirmDelete(false)}>
                CANCEL
              </button>
              <button
                className="primary-btn"
                style={{ marginTop: 0, background: "#ff6b6b", color: "#080808" }}
                onClick={deleteCourseFully}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
