"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HeaderBig } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { COURSES, loadNotes, saveNote, newId } from "@/lib/data";
import type { ClassNote } from "@/lib/types";

interface Question {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
}

type Phase = "select" | "quiz" | "results";

export default function PracticePage() {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [week, setWeek] = useState<number | null>(null);
  const [notes, setNotes] = useState<ClassNote[]>([]);
  const [phase, setPhase] = useState<Phase>("select");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [learnedText, setLearnedText] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => setNotes(loadNotes()), []);

  function saveLearned() {
    if (!courseId || learnedText.trim().length < 5) return;
    const today = new Date();
    const targetWeek = week ?? Math.ceil(today.getDate() / 7);
    const day = Math.min(28, (targetWeek - 1) * 7 + 1);
    const iso = new Date(today.getFullYear(), today.getMonth(), day)
      .toISOString()
      .slice(0, 10);
    saveNote({
      id: newId(),
      courseId,
      date: iso,
      rawContent: learnedText.trim(),
      aiSummary: "",
      keyPoints: [],
      createdAt: new Date().toISOString(),
    });
    setNotes(loadNotes());
    setLearnedText("");
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  const courseNotes = useMemo(
    () => (courseId ? notes.filter((n) => n.courseId === courseId) : []),
    [courseId, notes]
  );

  const weeksWithNotes = useMemo(() => {
    const weeks = new Set<number>();
    courseNotes.forEach((n) => {
      const w = Math.ceil(new Date(n.date).getDate() / 7);
      weeks.add(w);
    });
    return weeks;
  }, [courseNotes]);

  function startPractice() {
    const qs = getQuestions();
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(null));
    setCurrent(0);
    setRevealed(false);
    setPhase("quiz");
  }

  function selectAnswer(letter: string) {
    if (revealed) return;
    const next = [...answers];
    next[current] = letter;
    setAnswers(next);
    setRevealed(true);
  }

  function next() {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setRevealed(false);
    } else {
      setPhase("results");
    }
  }

  function reset() {
    setPhase("select");
    setCourseId(null);
    setWeek(null);
  }

  const score = answers.filter((a, i) => a === questions[i]?.correct).length;

  if (phase === "results") {
    const pct = score / questions.length;
    const verdict = pct >= 0.8 ? "STRONG WEEK." : pct >= 0.5 ? "GETTING THERE." : "NEEDS REVIEW.";
    return (
      <div className="screen">
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="practice-hero">
            <div className="score">{score}/{questions.length}</div>
            <div className="verdict">{verdict}</div>
          </div>
          <div className="result-bar">
            {answers.map((a, i) => (
              <div key={i} className={`rdot ${a === questions[i]?.correct ? "correct" : "wrong"}`}>
                {a === questions[i]?.correct ? "✓" : "✗"}
              </div>
            ))}
          </div>
          <div style={{ padding: "0 16px" }}>
            <button className="primary-btn" onClick={startPractice}>RETRY</button>
            <button className="ghost-btn" onClick={reset}>BACK</button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (phase === "quiz" && questions.length > 0) {
    const q = questions[current];
    const isCorrect = answers[current] === q.correct;
    return (
      <div className="screen">
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: 2, color: "var(--text-muted)" }}>
            {COURSES.find((c) => c.id === courseId)?.shortName} · WEEK {week}
          </div>
        </div>
        <div className="progress-top" style={{ margin: "12px 16px" }}>
          <div className="fill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
        <div style={{ flex: 1, overflow: "auto", paddingBottom: 20 }}>
          <div className="question-card">
            <div className="qnum">Q {current + 1} / {questions.length}</div>
            <div className="qtext">{q.question}</div>
            {(["A", "B", "C", "D"] as const).map((letter) => {
              let cls = "option-btn";
              if (revealed) {
                if (letter === q.correct) cls += " correct";
                else if (letter === answers[current]) cls += " wrong";
              }
              return (
                <button key={letter} className={cls} onClick={() => selectAnswer(letter)}>
                  <span className="letter">{letter}</span>
                  <span>{q.options[letter]}</span>
                </button>
              );
            })}
            {revealed && (
              <div className="explanation">
                <div className="verdict">{isCorrect ? "✓ Correct." : "✗ Wrong."}</div>
                {q.explanation}
              </div>
            )}
          </div>
          {revealed && (
            <div style={{ padding: "0 16px" }}>
              <button className="primary-btn" onClick={next}>
                {current < questions.length - 1 ? "NEXT →" : "SEE RESULTS"}
              </button>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="screen">
      <HeaderBig title="PRACTICE" subtitle="Test what you know." />

      <div className="scroll-area" style={{ padding: "16px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: 3, color: "var(--text-muted)", marginBottom: 10 }}>SELECT COURSE</div>
        <div className="filter-pills" style={{ padding: 0, flexWrap: "wrap" }}>
          {COURSES.map((c) => (
            <button key={c.id} className={`pill ${courseId === c.id ? "active" : ""}`} onClick={() => { setCourseId(c.id); setWeek(null); }}>
              {c.shortName}
            </button>
          ))}
        </div>

        {courseId && (
          <>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: 3, color: "var(--text-muted)", marginTop: 24, marginBottom: 10 }}>SELECT WEEK</div>
            <div className="filter-pills" style={{ padding: 0, flexWrap: "wrap" }}>
              {Array.from({ length: 16 }).map((_, i) => {
                const w = i + 1;
                const has = weeksWithNotes.has(w);
                return (
                  <button
                    key={w}
                    className={`pill ${week === w ? "active" : ""}`}
                    style={!has && week !== w ? { opacity: 0.25 } : {}}
                    onClick={() => setWeek(w)}
                  >
                    WK {w}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {courseId && (
          <div className="field" style={{ marginTop: 24 }}>
            <label>WHAT I LEARNED / WANT TO PRACTICE</label>
            <textarea
              value={learnedText}
              onChange={(e) => setLearnedText(e.target.value)}
              placeholder="Topics, concepts, anything to drill on..."
              style={{ minHeight: 100 }}
            />
            <button
              className="primary-btn"
              onClick={saveLearned}
              disabled={savedFlash || learnedText.trim().length < 5}
              style={{ marginTop: 8 }}
            >
              {savedFlash ? "SAVED ✓" : week ? `SAVE TO WK ${week}` : "SAVE NOTE"}
            </button>
          </div>
        )}

        {courseId && week && (
          courseNotes.length > 0 ? (
            <button className="primary-btn" onClick={startPractice}>START PRACTICE →</button>
          ) : (
            <>
              <div className="empty" style={{ marginTop: 24 }}>
                NO NOTES FOR THIS WEEK.
                <div className="empty-sub">Go to Catch Up first.</div>
              </div>
              <Link href={`/catchup?course=${courseId}`} className="primary-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                GO TO CATCH UP →
              </Link>
            </>
          )
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function getQuestions(): Question[] {
  return [
    {
      question: "What is the primary benefit of internationalization for firms?",
      options: { A: "Tax avoidance", B: "Access to new markets and resources", C: "Reduced workforce", D: "Less competition" },
      correct: "B",
      explanation: "Internationalization gives firms access to new customers, talent pools, and resources across borders.",
    },
    {
      question: "Which framework analyzes internal strengths and external opportunities?",
      options: { A: "Porter's Five Forces", B: "PESTEL", C: "SWOT Analysis", D: "BCG Matrix" },
      correct: "C",
      explanation: "SWOT analyzes Strengths, Weaknesses, Opportunities, and Threats — both internal and external factors.",
    },
    {
      question: "What does 'bounded rationality' mean in decision making?",
      options: { A: "Decisions are always optimal", B: "Decision makers have unlimited info", C: "Cognitive limits constrain rational decisions", D: "Decisions are random" },
      correct: "C",
      explanation: "Herbert Simon's concept: humans make satisfactory rather than optimal decisions due to cognitive limits.",
    },
    {
      question: "What is a 'Born Global' firm?",
      options: { A: "Only operates domestically", B: "Internationalizes from or near founding", C: "A government enterprise", D: "A firm older than 100 years" },
      correct: "B",
      explanation: "Born Global firms pursue international markets from inception rather than following gradual stages.",
    },
    {
      question: "Which advantage comes from resources that are hard to imitate?",
      options: { A: "Cost leadership", B: "Differentiation", C: "Resource-based advantage", D: "First-mover advantage" },
      correct: "C",
      explanation: "The RBV argues sustained advantage comes from valuable, rare, inimitable, non-substitutable resources.",
    },
  ];
}
