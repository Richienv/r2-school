"use client";

import { useState } from "react";
import { addGrade, updateGrade, deleteGrade } from "@/lib/grades";
import type { Grade } from "@/lib/types";

export function GradeSheet({
  courseId,
  existing,
  onClose,
  onSaved,
  onDeleted,
}: {
  courseId: string;
  existing?: Grade;
  onClose: () => void;
  onSaved: (g: Grade) => void;
  onDeleted?: () => void;
}) {
  const isEdit = Boolean(existing);
  const [label, setLabel] = useState(existing?.label ?? "");
  const [weight, setWeight] = useState<string>(
    existing ? String(existing.weight) : ""
  );
  const [score, setScore] = useState<string>(
    existing && existing.score !== null ? String(existing.score) : ""
  );

  const weightNum = Number(weight);
  const scoreNum = score === "" ? null : Number(score);
  const canSave =
    label.trim().length > 0 &&
    !Number.isNaN(weightNum) &&
    weightNum > 0 &&
    weightNum <= 100 &&
    (scoreNum === null || (!Number.isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 100));

  function save() {
    if (!canSave) return;
    if (isEdit && existing) {
      const updated = updateGrade(existing.id, {
        label: label.trim(),
        weight: weightNum,
        score: scoreNum,
      });
      if (updated) onSaved(updated);
    } else {
      const created = addGrade({
        courseId,
        label: label.trim(),
        weight: weightNum,
        score: scoreNum,
      });
      onSaved(created);
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="drag-handle" />
        <div className="sheet-title">{isEdit ? "EDIT GRADE" : "ADD GRADE"}</div>

        <div className="field">
          <label>COMPONENT</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Midterm, Group Project"
            autoFocus
          />
        </div>

        <div className="field">
          <label>WEIGHT (% OF FINAL)</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 30"
          />
        </div>

        <div className="field">
          <label>SCORE (% — LEAVE EMPTY IF NOT GRADED)</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="e.g. 85"
          />
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
            {isEdit ? "SAVE GRADE" : "ADD GRADE"}
          </button>
        </div>

        {isEdit && existing && (
          <button
            className="ghost-btn grade-delete"
            onClick={() => {
              deleteGrade(existing.id);
              onDeleted?.();
              onClose();
            }}
          >
            DELETE GRADE
          </button>
        )}
      </div>
    </div>
  );
}
