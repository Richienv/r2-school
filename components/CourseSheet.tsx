"use client";

import { useState } from "react";
import { addCourse, updateCourse, COURSE_PALETTE } from "@/lib/courses";
import type { Course } from "@/lib/types";

export function CourseSheet({
  existing,
  onClose,
  onSaved,
}: {
  existing?: Course;
  onClose: () => void;
  onSaved: (c: Course) => void;
}) {
  const isEdit = Boolean(existing);
  const [name, setName] = useState(existing?.name ?? "");
  const [shortName, setShortName] = useState(existing?.shortName ?? "");
  const [professor, setProfessor] = useState(
    existing?.professor.replace(/^Prof\.?\s*/i, "") ?? ""
  );
  const [color, setColor] = useState(existing?.color ?? COURSE_PALETTE[0]);

  const canSave = name.trim().length > 0 && shortName.trim().length > 0;

  function save() {
    if (!canSave) return;
    const cleanedProf = professor.trim();
    const profValue = cleanedProf ? `Prof. ${cleanedProf}` : "Prof.";
    if (isEdit && existing) {
      const updated = updateCourse(existing.id, {
        name: name.trim(),
        shortName: shortName.trim().toUpperCase(),
        professor: profValue,
        color,
      });
      if (updated) onSaved(updated);
    } else {
      const created = addCourse({
        name: name.trim(),
        shortName: shortName.trim().toUpperCase(),
        professor: profValue,
        color,
      });
      onSaved(created);
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="drag-handle" />
        <div className="sheet-title">{isEdit ? "EDIT COURSE" : "ADD COURSE"}</div>

        <div className="field">
          <label>NAME</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. International Business"
            autoFocus
          />
        </div>

        <div className="field">
          <label>SHORT CODE</label>
          <input
            value={shortName}
            onChange={(e) => setShortName(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="e.g. IB"
            maxLength={6}
          />
        </div>

        <div className="field">
          <label>PROFESSOR</label>
          <input
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            placeholder="Last name (optional)"
          />
        </div>

        <div className="field">
          <label>COLOR</label>
          <div className="color-grid">
            {COURSE_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                className={`color-dot ${color === c ? "selected" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="sheet-actions">
          <button className="ghost-btn" style={{ marginTop: 0 }} onClick={onClose}>
            CANCEL
          </button>
          <button
            className="primary-btn"
            style={{ marginTop: 0 }}
            onClick={save}
            disabled={!canSave}
          >
            {isEdit ? "SAVE COURSE" : "ADD COURSE"}
          </button>
        </div>
      </div>
    </div>
  );
}
