"use client";

import { useState } from "react";
import { COURSES, upsertAssignment, newId } from "@/lib/data";
import type { Assignment, AssignmentType } from "@/lib/types";

const TYPES: { value: AssignmentType; label: string }[] = [
  { value: "GROUP_PRESENTATION", label: "Group Presentation" },
  { value: "INDIVIDUAL_PRESENTATION", label: "Individual Presentation" },
  { value: "HOMEWORK", label: "Homework" },
  { value: "INDIVIDUAL_PROJECT", label: "Individual Project" },
  { value: "MIDTERM", label: "Midterm" },
  { value: "FINAL", label: "Final" },
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
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState("");

  function save() {
    if (!title || !dueDate) return;
    const a: Assignment = {
      id: newId(),
      courseId,
      title,
      type,
      dueDate,
      status: "NOT_STARTED",
      description: description || undefined,
      groupMembers: type === "GROUP_PRESENTATION" && members ? members.split(",").map((s) => s.trim()) : undefined,
      notes: "",
      progress: 0,
      checklist: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };
    upsertAssignment(a);
    onSaved();
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="label" style={{ marginBottom: 16 }}>ADD ASSIGNMENT</div>

        <div className="field">
          <label>COURSE</label>
          <div className="filter-pills" style={{ padding: 0 }}>
            {COURSES.map((c) => (
              <button
                key={c.id}
                className={`pill ${courseId === c.id ? "active" : ""}`}
                onClick={() => setCourseId(c.id)}
              >
                {c.shortName}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>TITLE</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title" />
        </div>

        <div className="field">
          <label>TYPE</label>
          <select value={type} onChange={(e) => setType(e.target.value as AssignmentType)}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>DUE DATE</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <div className="field">
          <label>DESCRIPTION (OPTIONAL)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {type === "GROUP_PRESENTATION" && (
          <div className="field">
            <label>GROUP MEMBERS (COMMA-SEPARATED)</label>
            <input value={members} onChange={(e) => setMembers(e.target.value)} placeholder="Richie, ..." />
          </div>
        )}

        <div className="sheet-actions">
          <button className="ghost-btn" style={{ margin: 0 }} onClick={onClose}>CANCEL</button>
          <button className="primary-btn" style={{ margin: 0 }} onClick={save}>SAVE ASSIGNMENT</button>
        </div>
      </div>
    </div>
  );
}
