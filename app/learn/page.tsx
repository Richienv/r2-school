"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HeaderBig } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import {
  currentWeekNumber,
  deleteWeekEntry,
  getWeekEntry,
  loadWeekEntries,
  newId,
  upsertWeekEntry,
} from "@/lib/data";
import { useCourses, getCourseById } from "@/lib/courses";
import { useSettings } from "@/lib/settings";
import type { Confidence, WeekEntry } from "@/lib/types";

type View =
  | { kind: "list" }
  | { kind: "fill"; courseId: string; week: number }
  | { kind: "view"; courseId: string; week: number };

const CONFIDENCE_OPTIONS: { value: Confidence; label: string; dot: string }[] = [
  { value: "SHAKY", label: "SHAKY", dot: "🔴" },
  { value: "OKAY", label: "OKAY", dot: "🟡" },
  { value: "SOLID", label: "SOLID", dot: "🟢" },
];

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="screen"><HeaderBig title="LEARN" /><BottomNav /></div>}>
      <LearnInner />
    </Suspense>
  );
}

function LearnInner() {
  const searchParams = useSearchParams();
  const [settings] = useSettings();
  const [courses] = useCourses();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [entries, setEntries] = useState<WeekEntry[]>([]);
  const [view, setView] = useState<View>({ kind: "list" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEntries(loadWeekEntries());
    setMounted(true);
    const c = searchParams.get("course");
    const w = searchParams.get("week");
    if (c && courses.some((x) => x.id === c)) {
      setCourseId(c);
      if (w) {
        const n = Number(w);
        if (!Number.isNaN(n) && n >= 1 && n <= 16) {
          setView({ kind: "fill", courseId: c, week: n });
        }
      }
    }
  }, [searchParams, courses]);

  const currentWeek = useMemo(
    () => (mounted ? currentWeekNumber(settings.semesterStart) : 0),
    [mounted, settings.semesterStart]
  );

  function refreshEntries() {
    setEntries(loadWeekEntries());
  }

  if (view.kind === "fill") {
    return (
      <FillTemplate
        courseId={view.courseId}
        week={view.week}
        existing={getWeekEntry(view.courseId, view.week)}
        onDone={() => {
          refreshEntries();
          setView({ kind: "list" });
        }}
        onCancel={() => setView({ kind: "list" })}
      />
    );
  }

  if (view.kind === "view") {
    const entry = entries.find(
      (e) => e.courseId === view.courseId && e.weekNumber === view.week
    );
    if (!entry) {
      return (
        <div className="screen">
          <HeaderBig title="LEARN" />
          <div className="empty">NOT FOUND</div>
          <BottomNav />
        </div>
      );
    }
    return (
      <WeekBriefing
        entry={entry}
        onBack={() => setView({ kind: "list" })}
        onEdit={() => setView({ kind: "fill", courseId: entry.courseId, week: entry.weekNumber })}
        onDeleted={() => {
          refreshEntries();
          setView({ kind: "list" });
        }}
      />
    );
  }

  const courseEntries = courseId ? entries.filter((e) => e.courseId === courseId) : [];

  return (
    <div className="screen">
      <HeaderBig title="LEARN" subtitle="Your weekly knowledge log." />

      <div className="scroll-area" style={{ padding: "16px 16px 40px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: 3, color: "var(--text-muted)", marginBottom: 10 }}>
          SELECT COURSE
        </div>
        <div className="filter-pills" style={{ padding: 0, flexWrap: "wrap" }}>
          {courses.map((c) => (
            <button
              key={c.id}
              className={`pill ${courseId === c.id ? "active" : ""}`}
              onClick={() => setCourseId(c.id)}
            >
              {c.shortName}
            </button>
          ))}
        </div>

        {!courseId ? (
          <div className="empty" style={{ marginTop: 40, fontSize: 20 }}>
            PICK A COURSE
            <div className="empty-sub">to view your weekly briefings</div>
          </div>
        ) : (
          <div className="week-list">
            {Array.from({ length: 16 }).map((_, i) => {
              const wk = i + 1;
              const entry = courseEntries.find((e) => e.weekNumber === wk);
              const isCurrent = mounted && wk === currentWeek;
              return (
                <button
                  key={wk}
                  className="week-row"
                  onClick={() =>
                    setView(
                      entry
                        ? { kind: "view", courseId, week: wk }
                        : { kind: "fill", courseId, week: wk }
                    )
                  }
                >
                  <span className="wk-label">
                    {isCurrent && <span className="wk-dot-now" />}
                    WK {wk}
                  </span>
                  <span className={`wk-title ${entry ? "filled" : "empty"}`}>
                    {entry ? entry.topicTitle : "[EMPTY]"}
                  </span>
                  <span className="wk-chev">{entry ? "›" : "+"}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function FillTemplate({
  courseId,
  week,
  existing,
  onDone,
  onCancel,
}: {
  courseId: string;
  week: number;
  existing?: WeekEntry;
  onDone: () => void;
  onCancel: () => void;
}) {
  const course = getCourseById(courseId);
  const [topicTitle, setTopicTitle] = useState(existing?.topicTitle ?? "");
  const [covered, setCovered] = useState(existing?.covered ?? "");
  const [concepts, setConcepts] = useState<string[]>(existing?.keyConcepts ?? []);
  const [conceptDraft, setConceptDraft] = useState("");
  const [learned, setLearned] = useState(existing?.learned ?? "");
  const [profNotes, setProfNotes] = useState(existing?.profNotes ?? "");
  const [confidence, setConfidence] = useState<Confidence | null>(existing?.confidence ?? null);

  function addConcept() {
    const v = conceptDraft.trim();
    if (!v) return;
    if (!concepts.includes(v)) setConcepts([...concepts, v]);
    setConceptDraft("");
  }

  function removeConcept(tag: string) {
    setConcepts(concepts.filter((c) => c !== tag));
  }

  function onConceptKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addConcept();
    } else if (e.key === "Backspace" && conceptDraft === "" && concepts.length > 0) {
      setConcepts(concepts.slice(0, -1));
    }
  }

  const canSave = topicTitle.trim().length > 0 && confidence !== null;

  function save() {
    if (!canSave || !confidence) return;
    const entry: WeekEntry = {
      id: existing?.id ?? newId(),
      courseId,
      weekNumber: week,
      topicTitle: topicTitle.trim(),
      covered: covered.trim(),
      keyConcepts: concepts,
      learned: learned.trim(),
      profNotes: profNotes.trim(),
      confidence,
      updatedAt: new Date().toISOString(),
    };
    upsertWeekEntry(entry);
    onDone();
  }

  return (
    <div className="screen">
      <div className="cd-header" style={{ paddingBottom: 14 }}>
        <button className="cd-back" onClick={onCancel}>← LEARN</button>
        <div className="cd-code" style={{ color: "var(--accent)" }}>
          WK {week} · {course?.shortName}
        </div>
        <div className="cd-name">{course?.name}</div>
      </div>

      <div className="scroll-area" style={{ padding: "20px 16px 40px" }}>
        <div className="field">
          <label>WEEK TOPIC</label>
          <input
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            placeholder="e.g. Globalization & MNEs"
          />
        </div>

        <div className="field">
          <label>WHAT WAS COVERED</label>
          <textarea
            value={covered}
            onChange={(e) => setCovered(e.target.value)}
            placeholder="Main themes from lecture/slides..."
            rows={4}
          />
        </div>

        <div className="field">
          <label>KEY CONCEPTS</label>
          <div className="tag-input">
            {concepts.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
                <button
                  type="button"
                  className="tag-x"
                  onClick={() => removeConcept(tag)}
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              className="tag-entry"
              value={conceptDraft}
              onChange={(e) => setConceptDraft(e.target.value)}
              onKeyDown={onConceptKey}
              onBlur={addConcept}
              placeholder={concepts.length === 0 ? "Type concept, press Enter..." : ""}
            />
          </div>
        </div>

        <div className="field">
          <label>WHAT I LEARNED</label>
          <textarea
            value={learned}
            onChange={(e) => setLearned(e.target.value)}
            placeholder="In your own words, what did you actually take away?"
            rows={4}
          />
        </div>

        <div className="field">
          <label>PROF NOTES / EXAM HINTS</label>
          <textarea
            value={profNotes}
            onChange={(e) => setProfNotes(e.target.value)}
            placeholder="Anything the prof emphasized, hinted for exam..."
            rows={3}
          />
        </div>

        <div className="field">
          <label>CONFIDENCE LEVEL</label>
          <div className="confidence-row">
            {CONFIDENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`conf-pill ${confidence === opt.value ? "on" : ""}`}
                onClick={() => setConfidence(opt.value)}
              >
                <span className="conf-dot">{opt.dot}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="save-briefing"
          disabled={!canSave}
          onClick={save}
        >
          SAVE WEEK BRIEFING
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

function WeekBriefing({
  entry,
  onBack,
  onEdit,
  onDeleted,
}: {
  entry: WeekEntry;
  onBack: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const course = getCourseById(entry.courseId);
  const conf = CONFIDENCE_OPTIONS.find((c) => c.value === entry.confidence);

  function del() {
    if (!confirm("Delete this week briefing?")) return;
    deleteWeekEntry(entry.id);
    onDeleted();
  }

  return (
    <div className="screen">
      <div className="cd-header" style={{ paddingBottom: 14, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button className="cd-back" onClick={onBack}>← LEARN</button>
          {conf && (
            <span className={`conf-badge on`} style={{ marginTop: 14 }}>
              <span className="conf-dot">{conf.dot}</span>
              {conf.label}
            </span>
          )}
        </div>
        <div className="cd-code" style={{ color: "var(--accent)" }}>
          WK {entry.weekNumber} · {course?.shortName}
        </div>
      </div>

      <div className="scroll-area" style={{ padding: "20px 16px 40px" }}>
        <div className="brief-section">
          <div className="brief-label">TOPIC</div>
          <div className="brief-topic">{entry.topicTitle}</div>
        </div>

        {entry.covered && (
          <div className="brief-section">
            <div className="brief-label">COVERED</div>
            <div className="brief-body">{entry.covered}</div>
          </div>
        )}

        {entry.keyConcepts.length > 0 && (
          <div className="brief-section">
            <div className="brief-label">KEY CONCEPTS</div>
            <div className="tag-input static">
              {entry.keyConcepts.map((tag) => (
                <span key={tag} className="tag-pill">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {entry.learned && (
          <div className="brief-section">
            <div className="brief-label">WHAT I LEARNED</div>
            <div className="brief-body">{entry.learned}</div>
          </div>
        )}

        {entry.profNotes && (
          <div className="brief-section">
            <div className="brief-label">PROF NOTES</div>
            <div className="brief-body">{entry.profNotes}</div>
          </div>
        )}

        <div className="brief-actions">
          <button className="ghost-btn" style={{ marginTop: 0 }} onClick={del}>DELETE</button>
          <button className="primary-btn" style={{ marginTop: 0 }} onClick={onEdit}>EDIT</button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
