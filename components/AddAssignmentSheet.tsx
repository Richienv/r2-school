"use client";

import { useState } from "react";
import { COURSES, createAssignment } from "@/lib/data";
import type { AssignmentType } from "@/lib/types";

const TYPES: { value: AssignmentType; label: string }[] = [
  { value: "HOMEWORK", label: "Homework" },
  { value: "GROUP_PRESENTATION", label: "Group Presentation" },
  { value: "INDIVIDUAL_PROJECT", label: "Individual Project" },
  { value: "INDIVIDUAL_PRESENTATION", label: "Individual Presentation" },
  { value: "EXAM", label: "Exam" },
  { value: "QUIZ", label: "Quiz" },
  { value: "MEETING", label: "Meeting" },
  { value: "PREPARATION", label: "Preparation" },
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

  async function save() {
    if (!title || !dueDate) return;
    await createAssignment({
      courseId,
      title,
      type,
      dueDate,
      status: "NOT_STARTED",
      notes: "",
      progress: 0,
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
          <div className="cc-grid">
            {COURSES.map((c) => {
              const selected = courseId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`cc-opt ${selected ? "selected" : ""}`}
                  onClick={() => setCourseId(c.id)}
                >
                  <span className="cc-code" style={{ color: selected ? c.color : "#666" }}>
                    {c.shortName}
                  </span>
                  <span className="cc-name">{c.name}</span>
                </button>
              );
            })}
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
