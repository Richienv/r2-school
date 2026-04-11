"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { COURSES, getCourse, saveNote, newId } from "@/lib/data";
import type { ClassNote } from "@/lib/types";

interface Summary {
  keyConcepts: string[];
  whatToRemember: string;
  examTopics: string[];
}

export default function CatchupPage() {
  const [courseId, setCourseId] = useState(COURSES[0].id);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const c = params.get("course");
    if (c) setCourseId(c);
  }, []);

  async function generate() {
    if (content.trim().length < 10) {
      setError("Paste some content first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const course = getCourse(courseId);
      const res = await fetch("/api/catchup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, course: course?.name, date }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setSummary(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function saveSummary() {
    if (!summary) return;
    const note: ClassNote = {
      id: newId(),
      courseId,
      date,
      rawContent: content,
      aiSummary: summary.whatToRemember,
      keyPoints: summary.keyConcepts,
      examTopics: summary.examTopics,
      createdAt: new Date().toISOString(),
    };
    saveNote(note);
    setSummary(null);
    setContent("");
    alert("Saved to course notes");
  }

  function reset() {
    setSummary(null);
  }

  const course = getCourse(courseId);

  return (
    <div className="screen">
      <Header title="✦ CATCH UP" />
      <div className="scroll-list" style={{ padding: "16px 20px 16px" }}>
        <div className="label" style={{ marginBottom: 10 }}>PASTE SLIDES OR NOTES → GET KEY CONCEPTS</div>

        <div className="filter-pills" style={{ padding: "12px 0" }}>
          {COURSES.map((c) => (
            <button
              key={c.id}
              className={`pill ${courseId === c.id ? "active" : ""}`}
              onClick={() => setCourseId(c.id)}
              style={courseId === c.id ? { background: c.color, borderColor: c.color, color: "#000" } : {}}
            >
              {c.shortName}
            </button>
          ))}
        </div>

        <div className="field">
          <label>SESSION DATE</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {!summary ? (
          <>
            <div className="field">
              <label>LECTURE CONTENT</label>
              <textarea
                className="catchup-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste slide content, lecture notes, or key topics from today's class..."
              />
            </div>
            {error && <div style={{ color: "var(--danger)", fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <button className="primary-btn yellow" onClick={generate} disabled={loading}>
              {loading ? "GENERATING..." : "GENERATE SUMMARY →"}
            </button>
          </>
        ) : (
          <div className="summary-card">
            <div className="head">🤖 AI SUMMARY — {course?.shortName} {date}</div>
            <div className="section-block">
              <div className="label">KEY CONCEPTS</div>
              <ul>
                {summary.keyConcepts.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>
            <div className="section-block">
              <div className="label">WHAT TO REMEMBER</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>{summary.whatToRemember}</div>
            </div>
            <div className="section-block">
              <div className="label">LIKELY EXAM TOPICS</div>
              <ul>
                {summary.examTopics.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>
            <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button className="ghost-btn" style={{ margin: 0 }} onClick={reset}>TRY AGAIN</button>
              <button className="primary-btn" style={{ margin: 0 }} onClick={saveSummary}>SAVE TO COURSE</button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
