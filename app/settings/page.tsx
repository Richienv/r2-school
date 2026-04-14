"use client";

import { useEffect, useMemo, useState } from "react";
import { HeaderBig } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { COURSES, loadAssignments } from "@/lib/data";
import {
  TIMEZONES,
  todayInTz,
  useSettings,
  type DateFormat,
  type WeekFormat,
} from "@/lib/settings";

type EditKey =
  | `profile.${"name" | "studentId" | "program" | "university"}`
  | `professor.${string}`
  | null;

export default function SettingsPage() {
  const [settings, update] = useSettings();
  const [edit, setEdit] = useState<EditKey>(null);
  const [draft, setDraft] = useState("");
  const [mounted, setMounted] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => setMounted(true), []);

  const today = useMemo(
    () => (mounted ? todayInTz(settings.timezone) : ""),
    [mounted, settings.timezone]
  );

  function startEdit(key: Exclude<EditKey, null>, current: string) {
    setEdit(key);
    setDraft(current);
  }

  function commitEdit() {
    if (!edit) return;
    const value = draft.trim();
    if (edit.startsWith("profile.")) {
      const field = edit.split(".")[1] as keyof typeof settings.profile;
      update({ profile: { ...settings.profile, [field]: value } });
    } else if (edit.startsWith("professor.")) {
      const id = edit.split(".")[1];
      update({ professors: { ...settings.professors, [id]: value } });
    }
    setEdit(null);
  }

  function cancelEdit() {
    setEdit(null);
  }

  async function exportData() {
    try {
      const assignments = await loadAssignments();
      const data = {
        exported: new Date().toISOString(),
        assignments,
        settings,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `r2school-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  }

  function resetAssignments() {
    localStorage.removeItem("r2school.assignments.v2");
    localStorage.removeItem("r2school.seeded.v2");
    setConfirmReset(false);
    window.location.href = "/";
  }

  function bumpUrgent(delta: number) {
    const next = Math.max(1, Math.min(7, settings.urgentThreshold + delta));
    update({ urgentThreshold: next });
  }

  const dateFormats: { value: DateFormat; label: string }[] = [
    { value: "MMM DD", label: "APR 14" },
    { value: "DD MMM", label: "14 APR" },
    { value: "MM/DD", label: "04/14" },
  ];
  const weekFormats: { value: WeekFormat; label: string }[] = [
    { value: "WK", label: "WK 1" },
    { value: "Week", label: "Week 1" },
  ];

  return (
    <div className="screen">
      <HeaderBig title="SETTINGS" />

      <div className="scroll-area" style={{ padding: 0 }}>
        {/* PROFILE */}
        <Section label="PROFILE">
          <Row
            label="NAME"
            value={settings.profile.name}
            editing={edit === "profile.name"}
            draft={draft}
            setDraft={setDraft}
            onEdit={() => startEdit("profile.name", settings.profile.name)}
            onCommit={commitEdit}
            onCancel={cancelEdit}
          />
          <Row
            label="STUDENT ID"
            value={settings.profile.studentId}
            editing={edit === "profile.studentId"}
            draft={draft}
            setDraft={setDraft}
            onEdit={() => startEdit("profile.studentId", settings.profile.studentId)}
            onCommit={commitEdit}
            onCancel={cancelEdit}
          />
          <Row
            label="PROGRAM"
            value={settings.profile.program}
            editing={edit === "profile.program"}
            draft={draft}
            setDraft={setDraft}
            onEdit={() => startEdit("profile.program", settings.profile.program)}
            onCommit={commitEdit}
            onCancel={cancelEdit}
          />
          <Row
            label="UNIVERSITY"
            value={settings.profile.university}
            editing={edit === "profile.university"}
            draft={draft}
            setDraft={setDraft}
            onEdit={() => startEdit("profile.university", settings.profile.university)}
            onCommit={commitEdit}
            onCancel={cancelEdit}
            last
          />
        </Section>

        {/* TIME & DATE */}
        <Section label="TIME & DATE">
          <div className="set-row">
            <span className="set-label">TIMEZONE</span>
            <select
              className="set-select"
              value={settings.timezone}
              onChange={(e) => update({ timezone: e.target.value })}
            >
              {TIMEZONES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="set-row">
            <span className="set-label">CURRENT DATE</span>
            <span className="set-value set-readonly">{today || "—"}</span>
          </div>
          <div className="set-row">
            <span className="set-label">SEMESTER START</span>
            <input
              type="date"
              className="set-input-date"
              value={settings.semesterStart}
              onChange={(e) => update({ semesterStart: e.target.value })}
            />
          </div>
          <div className="set-row set-row-last">
            <span className="set-label">SEMESTER END</span>
            <input
              type="date"
              className="set-input-date"
              value={settings.semesterEnd}
              onChange={(e) => update({ semesterEnd: e.target.value })}
            />
          </div>
        </Section>

        {/* DISPLAY */}
        <Section label="DISPLAY">
          <div className="set-row">
            <span className="set-label">WEEK FORMAT</span>
            <div className="set-toggle">
              {weekFormats.map((w) => (
                <button
                  key={w.value}
                  className={`set-tog ${settings.weekFormat === w.value ? "on" : ""}`}
                  onClick={() => update({ weekFormat: w.value })}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
          <div className="set-row">
            <span className="set-label">DATE FORMAT</span>
            <div className="set-toggle">
              {dateFormats.map((d) => (
                <button
                  key={d.value}
                  className={`set-tog ${settings.dateFormat === d.value ? "on" : ""}`}
                  onClick={() => update({ dateFormat: d.value })}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="set-row set-row-last">
            <span className="set-label">URGENT THRESHOLD</span>
            <div className="set-stepper">
              <button className="set-step" onClick={() => bumpUrgent(-1)}>−</button>
              <span className="set-step-val">{settings.urgentThreshold}</span>
              <button className="set-step" onClick={() => bumpUrgent(1)}>+</button>
            </div>
          </div>
        </Section>

        {/* PROFESSORS */}
        <Section label="PROFESSORS" sub="tap to edit · used in Course tab">
          {COURSES.map((c, i) => {
            const key = `professor.${c.id}` as const;
            const current = settings.professors[c.id] ?? "";
            return (
              <div
                key={c.id}
                className={`set-row ${i === COURSES.length - 1 ? "set-row-last" : ""}`}
                onClick={() => edit !== key && startEdit(key, current)}
              >
                <span
                  className="set-label"
                  style={{ color: c.color, letterSpacing: "0.12em" }}
                >
                  {c.shortName}
                </span>
                {edit === key ? (
                  <input
                    autoFocus
                    className="set-input"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                ) : (
                  <span className="set-value">
                    {current ? `Prof. ${current}` : <em style={{ color: "#444" }}>— add —</em>}
                  </span>
                )}
              </div>
            );
          })}
        </Section>

        {/* DATA */}
        <Section label="DATA">
          <button className="set-action" onClick={exportData}>
            <span className="set-label">EXPORT DATA</span>
            <span className="set-action-chev">JSON ↓</span>
          </button>
          <button
            className="set-action set-row-last"
            onClick={() => setConfirmReset(true)}
          >
            <span className="set-label" style={{ color: "#ff6b6b" }}>RESET ASSIGNMENTS</span>
            <span className="set-action-chev" style={{ color: "#ff6b6b" }}>→</span>
          </button>
        </Section>

        {/* ABOUT */}
        <Section label="ABOUT">
          <StaticRow label="APP" value="R2·SCHOOL" />
          <StaticRow label="VERSION" value="1.0.0" />
          <StaticRow label="ECOSYSTEM" value="R2·OS" />
          <StaticRow label="BUILT FOR" value={settings.profile.name} last />
        </Section>

        <div style={{ padding: "20px 16px 40px", textAlign: "center" }}>
          <a
            href="https://r2-os.vercel.app"
            className="set-os-link"
          >
            R2·OS ↗
          </a>
        </div>
      </div>

      {confirmReset && (
        <div className="sheet-backdrop" onClick={() => setConfirmReset(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="drag-handle" />
            <div className="sheet-title">RESET?</div>
            <div style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 20 }}>
              Delete all assignments? This cannot be undone.
            </div>
            <div className="sheet-actions">
              <button className="ghost-btn" style={{ marginTop: 0 }} onClick={() => setConfirmReset(false)}>
                CANCEL
              </button>
              <button
                className="primary-btn"
                style={{ marginTop: 0, background: "#ff6b6b", color: "#080808" }}
                onClick={resetAssignments}
              >
                DELETE ALL
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function Section({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="set-section">
      <div className="set-section-label">{label}</div>
      {sub && <div className="set-section-sub">{sub}</div>}
      <div className="set-rows">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  editing,
  draft,
  setDraft,
  onEdit,
  onCommit,
  onCancel,
  last,
}: {
  label: string;
  value: string;
  editing: boolean;
  draft: string;
  setDraft: (v: string) => void;
  onEdit: () => void;
  onCommit: () => void;
  onCancel: () => void;
  last?: boolean;
}) {
  return (
    <div
      className={`set-row ${last ? "set-row-last" : ""}`}
      onClick={() => !editing && onEdit()}
    >
      <span className="set-label">{label}</span>
      {editing ? (
        <input
          autoFocus
          className="set-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommit();
            if (e.key === "Escape") onCancel();
          }}
        />
      ) : (
        <span className="set-value">{value}</span>
      )}
    </div>
  );
}

function StaticRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`set-row ${last ? "set-row-last" : ""}`}>
      <span className="set-label">{label}</span>
      <span className="set-value set-readonly">{value}</span>
    </div>
  );
}
