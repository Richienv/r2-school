"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { COURSES, getCourse, saveNote, newId } from "@/lib/data";

export default function CatchupPage() {
  const [courseId, setCourseId] = useState(COURSES[0].id);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const c = params.get("course");
    if (c) setCourseId(c);
  }, []);

  function save() {
    if (content.trim().length < 5) return;
    const course = getCourse(courseId);
    saveNote({
      id: newId(),
      courseId,
      date,
      rawContent: content,
      aiSummary: "",
      keyPoints: [],
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setContent("");
    }, 1500);
  }

  const course = getCourse(courseId);

  return (
    <div className="screen">
      <Header title="CATCH UP" />
      <div className="scroll-list" style={{ padding: "16px 20px 16px" }}>
        <div className="label" style={{ marginBottom: 10 }}>PASTE SLIDES OR NOTES TO SAVE</div>

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

        <div className="field">
          <label>LECTURE CONTENT</label>
          <textarea
            className="catchup-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste slide content, lecture notes, or key topics from today's class..."
          />
        </div>

        <button className="primary-btn yellow" onClick={save} disabled={saved || content.trim().length < 5}>
          {saved ? "SAVED ✓" : "SAVE TO COURSE NOTES"}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
