"use client";

import { useState } from "react";
import { COURSES, createAssignment } from "@/lib/data";
import type { AssignmentStatus, AssignmentType } from "@/lib/types";

const TYPES: { value: AssignmentType; label: string }[] = [
  { value: "HOMEWORK", label: "Homework" },
  { value: "GROUP_PRESENTATION", label: "Group Presentation" },
  { value: "INDIVIDUAL_PROJECT", label: "Individual Project" },
  { value: "INDIVIDUAL_PRESENTATION", label: "Individual Presentation" },
  { value: "FINAL", label: "Exam" },
  { value: "MIDTERM", label: "Quiz" },
];

const STATUSES: { value: AssignmentStatus; label: string }[] = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

export function AddAssignmentSheet({
  defaultCourseId,
  onClose,
  onSaved,
}: {
  defaultCourseId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [courseId, setCourseId] = useState(defaultCourseId ?? COURSES[0].id);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<AssignmentType>("HOMEWORK");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<AssignmentStatus>("NOT_STARTED");
  const [progress, setProgress] = useState(0);

  async function save() {
    if (!title || !dueDate) return;
    await createAssignment({
      courseId,
      title,
      type,
      dueDate,
      status,
      notes: "",
      progress,
      checklist: [],
    });
    onSaved();
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="drag-handle" />
        <div className="sheet-title">ADD ASSIGNMENT</div>

        <div className="field">
          <label>TITLE</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" />
        </div>

        <div className="field">
          <label>COURSE</label>
          <div className="filter-pills" style={{ padding: 0, flexWrap: "wrap" }}>
            {COURSES.map((c) => (
              <button key={c.id} className={`pill ${courseId === c.id ? "active" : ""}`} onClick={() => setCourseId(c.id)}>
                {c.shortName}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>TYPE</label>
          <div className="filter-pills" style={{ padding: 0, flexWrap: "wrap" }}>
            {TYPES.map((t) => (
              <button key={t.value} className={`pill ${type === t.value ? "active" : ""}`} onClick={() => setType(t.value)}>
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>DUE DATE</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <div className="field">
          <label>STATUS</label>
          <div className="filter-pills" style={{ padding: 0, flexWrap: "wrap" }}>
            {STATUSES.map((s) => (
              <button key={s.value} className={`pill ${status === s.value ? "active" : ""}`} onClick={() => setStatus(s.value)}>
                {s.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>PROGRESS</label>
          <div className="slider-row">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
            <span className="slider-val">{progress}%</span>
          </div>
        </div>

        <div className="sheet-actions">
          <button className="ghost-btn" style={{ marginTop: 0 }} onClick={onClose}>CANCEL</button>
          <button className="primary-btn" style={{ marginTop: 0 }} onClick={save} disabled={!title || !dueDate}>
            SAVE ASSIGNMENT
          </button>
        </div>
      </div>
    </div>
  );
}
