"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { getCourse, saveNote, newId } from "@/lib/data";
import { useCourses } from "@/lib/courses";

export default function CatchupPage() {
  const [courses] = useCourses();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
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
      <div className="header">
        <Link href={course ? `/courses/${course.id}` : "/courses"} style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-muted)" }}>
          ← BACK
        </Link>
        <div className="logo" style={{ fontSize: 18 }}>CATCH UP</div>
        <div style={{ width: 40 }} />
      </div>

      <div className="scroll-area" style={{ padding: 16 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: 3, color: "var(--text-muted)", marginBottom: 10 }}>
          PASTE SLIDES OR NOTES TO SAVE
        </div>

        <div className="filter-pills" style={{ padding: "12px 0" }}>
          {courses.map((c) => (
            <button key={c.id} className={`pill ${courseId === c.id ? "active" : ""}`} onClick={() => setCourseId(c.id)}>
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

        <button className="primary-btn" onClick={save} disabled={saved || content.trim().length < 5}>
          {saved ? "SAVED ✓" : "SAVE TO COURSE NOTES"}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
