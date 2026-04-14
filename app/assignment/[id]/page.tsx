"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { loadAssignments, updateAssignment, deleteAssignment, getCourse, daysUntil, typeLabel, newId } from "@/lib/data";
import type { Assignment, AssignmentStatus, ChecklistItem } from "@/lib/types";

const STATUSES: AssignmentStatus[] = ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "DONE"];

export default function AssignmentDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [a, setA] = useState<Assignment | null>(null);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    loadAssignments().then((list) => {
      setA(list.find((x) => x.id === params.id) ?? null);
    });
  }, [params.id]);

  if (!a) return <div className="screen"><div className="empty">NOT FOUND</div><BottomNav /></div>;

  const course = getCourse(a.courseId);
  const days = daysUntil(a.dueDate);

  function update(patch: Partial<Assignment>) {
    const next = { ...a!, ...patch };
    setA(next);
    updateAssignment(next.id, patch);
  }

  function toggleItem(id: string) {
    const checklist = (a!.checklist ?? []).map((c) => (c.id === id ? { ...c, done: !c.done } : c));
    const progress = checklist.length > 0 ? Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100) : a!.progress;
    update({ checklist, progress });
  }

  function addItem() {
    if (!newItem.trim()) return;
    const item: ChecklistItem = { id: newId(), text: newItem.trim(), done: false };
    update({ checklist: [...(a!.checklist ?? []), item] });
    setNewItem("");
  }

  async function removeAssignment() {
    if (!confirm("Delete this assignment?")) return;
    await deleteAssignment(a!.id);
    router.push("/");
  }

  return (
    <div className="screen">
      <Link href="/" className="back-link">← HOME</Link>
      <div className="detail-head" style={{ borderLeft: "3px solid white" }}>
        <div className="type-badge">{typeLabel(a.type)}</div>
        <input
          className="title"
          value={a.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Assignment title"
          style={{ background: "transparent", border: 0, outline: "none", color: "var(--text)", width: "100%", padding: 0, font: "inherit" }}
        />
        <div className="meta">
          <span>{course?.name}</span>
          <span>·</span>
          <span>{course?.professor}</span>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-row">
          <div className="k">DUE</div>
          <div className="v" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <input
              type="date"
              value={a.dueDate}
              onChange={(e) => update({ dueDate: e.target.value })}
              style={{ flex: 1 }}
            />
            <span
              style={{
                fontFamily: "var(--display)",
                whiteSpace: "nowrap",
                color: days <= 0 ? "#ff4444" : "var(--accent)",
              }}
            >
              {days < 0
                ? "OVERDUE"
                : days === 0
                ? "TODAY"
                : days === 1
                ? "TOMORROW"
                : `${days} DAYS`}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <div className="k">STATUS</div>
          <select value={a.status} onChange={(e) => update({ status: e.target.value as AssignmentStatus })}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>

        {a.groupMembers && a.groupMembers.length > 0 && (
          <div className="detail-row">
            <div className="k">GROUP MEMBERS</div>
            <div className="v">{a.groupMembers.join(", ")}</div>
          </div>
        )}

        {a.description && (
          <div className="detail-row">
            <div className="k">DESCRIPTION</div>
            <div className="v">{a.description}</div>
          </div>
        )}

        <div className="detail-row">
          <div className="k">NOTES</div>
          <textarea value={a.notes ?? ""} onChange={(e) => update({ notes: e.target.value })} placeholder="Add notes..." />
        </div>

        <div className="detail-row">
          <div className="k">CHECKLIST</div>
          {(a.checklist ?? []).map((c) => (
            <div key={c.id} className={`checklist-item ${c.done ? "done" : ""}`}>
              <input type="checkbox" checked={c.done} onChange={() => toggleItem(c.id)} />
              <span className="text">{c.text}</span>
            </div>
          ))}
          <div className="flex-row" style={{ marginTop: 10 }}>
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="+ Add checklist item"
              style={{ flex: 1, padding: 10, background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 8, color: "var(--text)" }}
            />
            <button className="pill active" onClick={addItem}>ADD</button>
          </div>
        </div>

        <button className="primary-btn" onClick={() => update({ status: a.status === "SUBMITTED" ? "DONE" : "SUBMITTED" })}>
          {a.status === "SUBMITTED" ? "MARK DONE ✓" : a.status === "DONE" ? "DONE ✓" : "MARK SUBMITTED ✓"}
        </button>
        <button className="ghost-btn" onClick={removeAssignment}>DELETE</button>
      </div>

      <BottomNav />
    </div>
  );
}
