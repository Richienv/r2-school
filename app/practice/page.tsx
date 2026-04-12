"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HeaderBig } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { COURSES, loadNotes, getCourse } from "@/lib/data";
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

  useEffect(() => setNotes(loadNotes()), []);

  const courseNotes = useMemo(
    () => (courseId ? notes.filter((n) => n.courseId === courseId) : []),
    [courseId, notes]
  );

  const weeksWithNotes = useMemo(() => {
    const weeks = new Set<number>();
    courseNotes.forEach((n) => {
      const d = new Date(n.date);
      const weekNum = Math.ceil((d.getDate()) / 7);
      weeks.add(weekNum);
    });
    return weeks;
  }, [courseNotes]);

  function startPractice() {
    const qs = generateLocalQuestions(courseNotes);
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(null));
    setCurrent(0);
    setRevealed(false);
    setPhase("quiz");
  }

  function selectAnswer(letter: string) {
    if (revealed) return;
    const newAnswers = [...answers];
    newAnswers[current] = letter;
    setAnswers(newAnswers);
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
  const course = courseId ? getCourse(courseId) : null;

  if (phase === "results") {
    const verdict = score >= questions.length * 0.8 ? "STRONG WEEK." : score >= questions.length * 0.5 ? "GETTING THERE." : "NEEDS REVIEW.";
    return (
      <div className="screen">
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div className="practice-hero">
            <div className="score">{score}/{questions.length}</div>
            <div className="verdict">{verdict}</div>
          </div>
          <div className="result-bar">
            {answers.map((a, i) => (
              <div key={i} className={`dot ${a === questions[i]?.correct ? "correct" : "wrong"}`}>
                {a === questions[i]?.correct ? "✓" : "✗"}
              </div>
            ))}
          </div>
          <div style={{ padding: "0 20px" }}>
            <button className="primary-btn" onClick={startPractice}>RETRY</button>
            <button className="ghost-btn" onClick={reset}>BACK TO COURSES</button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (phase === "quiz" && questions.length > 0) {
    const q = questions[current];
    return (
      <div className="screen">
        <div style={{ padding: "16px 20px 0" }}>
          <div className="label">{course?.shortName} · WEEK {week}</div>
        </div>
        <div className="progress-top" style={{ margin: "12px 20px" }}>
          <div className="fill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
        <div style={{ flex: 1, overflow: "auto", paddingBottom: 20 }}>
          <div className="question-card">
            <div className="qnum">Q {current + 1}/{questions.length}</div>
            <div className="qtext">{q.question}</div>
            {(["A", "B", "C", "D"] as const).map((letter) => {
              let cls = "option-btn";
              if (revealed) {
                if (letter === q.correct) cls += " correct";
                else if (letter === answers[current]) cls += " wrong";
              } else if (letter === answers[current]) {
                cls += " selected";
              }
              return (
                <button key={letter} className={cls} onClick={() => selectAnswer(letter)}>
                  <span className="letter">{letter}</span>
                  <span>{q.options[letter]}</span>
                </button>
              );
            })}
            {revealed && (
              <div className="explanation">{q.explanation}</div>
            )}
          </div>
          {revealed && (
            <div style={{ padding: "0 20px" }}>
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
      <HeaderBig title="PRACTICE" subtitle="TEST WHAT YOU KNOW" />

      <div className="scroll-area" style={{ padding: "16px 20px" }}>
        <div className="label" style={{ marginBottom: 10 }}>SELECT COURSE</div>
        <div className="filter-pills" style={{ padding: 0, flexWrap: "wrap" }}>
          {COURSES.map((c) => (
            <button
              key={c.id}
              className={`pill ${courseId === c.id ? "active" : ""}`}
              onClick={() => { setCourseId(c.id); setWeek(null); }}
            >
              {c.shortName}
            </button>
          ))}
        </div>

        {courseId && (
          <>
            <div className="label" style={{ marginTop: 24, marginBottom: 10 }}>SELECT WEEK</div>
            <div className="filter-pills" style={{ padding: 0, flexWrap: "wrap" }}>
              {Array.from({ length: 16 }).map((_, i) => {
                const w = i + 1;
                const hasNotes = weeksWithNotes.has(w);
                return (
                  <button
                    key={w}
                    className={`pill ${week === w ? "yellow-active" : ""}`}
                    style={!hasNotes && week !== w ? { opacity: 0.3 } : {}}
                    onClick={() => setWeek(w)}
                  >
                    WK {w}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {courseId && week && (
          courseNotes.length > 0 ? (
            <button className="primary-btn" onClick={startPractice}>START PRACTICE →</button>
          ) : (
            <div className="empty" style={{ marginTop: 24 }}>
              NO NOTES FOR THIS WEEK YET.<br />GO TO CATCH UP FIRST.
              <Link href={`/catchup?course=${courseId}`} className="primary-btn white" style={{ display: "block", marginTop: 16 }}>
                GO TO CATCH UP →
              </Link>
            </div>
          )
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function generateLocalQuestions(notes: ClassNote[]): Question[] {
  const combined = notes.map((n) => n.rawContent).join("\n").slice(0, 2000);
  if (!combined.trim()) {
    return [
      {
        question: "What is the primary benefit of internationalization for firms?",
        options: { A: "Tax avoidance", B: "Access to new markets and resources", C: "Reduced workforce", D: "Less competition" },
        correct: "B",
        explanation: "Internationalization gives firms access to new customers, talent pools, and resources across borders.",
      },
      {
        question: "Which framework analyzes a firm's internal strengths and external opportunities?",
        options: { A: "Porter's Five Forces", B: "PESTEL", C: "SWOT Analysis", D: "BCG Matrix" },
        correct: "C",
        explanation: "SWOT analyzes Strengths, Weaknesses, Opportunities, and Threats — covering both internal and external factors.",
      },
      {
        question: "What does 'bounded rationality' mean in decision making?",
        options: { A: "Decisions are always optimal", B: "Decision makers have unlimited information", C: "Cognitive limits constrain rational decisions", D: "Decisions are random" },
        correct: "C",
        explanation: "Herbert Simon's concept: humans make satisfactory rather than optimal decisions due to cognitive limits and incomplete information.",
      },
      {
        question: "What is a 'Born Global' firm?",
        options: { A: "A firm that only operates domestically", B: "A firm that internationalizes from or near founding", C: "A government-owned enterprise", D: "A firm older than 100 years" },
        correct: "B",
        explanation: "Born Global firms pursue international markets from inception rather than following gradual internationalization stages.",
      },
      {
        question: "Which competitive advantage comes from unique resources that are hard to imitate?",
        options: { A: "Cost leadership", B: "Differentiation", C: "Resource-based advantage", D: "First-mover advantage" },
        correct: "C",
        explanation: "The Resource-Based View (RBV) argues sustained advantage comes from valuable, rare, inimitable, non-substitutable resources.",
      },
    ];
  }
  return [
    {
      question: "Based on your notes, which concept was most emphasized?",
      options: { A: "Market entry strategies", B: "Competitive analysis", C: "Innovation frameworks", D: "Financial modeling" },
      correct: "A",
      explanation: "Review your notes to verify — this is a practice question to get you started.",
    },
    {
      question: "What is the key takeaway from the most recent lecture?",
      options: { A: "Theory application", B: "Case study analysis", C: "Strategic planning", D: "All of the above" },
      correct: "D",
      explanation: "MBA lectures typically integrate theory, cases, and strategy. Review your notes for specifics.",
    },
    {
      question: "Which analytical framework was discussed?",
      options: { A: "PESTEL", B: "SWOT", C: "Porter's Five Forces", D: "Value Chain Analysis" },
      correct: "B",
      explanation: "SWOT is one of the most commonly used frameworks in MBA strategy courses.",
    },
    {
      question: "What role does competitive advantage play in strategy?",
      options: { A: "It's irrelevant", B: "It's the foundation of strategic positioning", C: "It only matters for startups", D: "It's a financial metric" },
      correct: "B",
      explanation: "Competitive advantage is central to strategic management — it defines how a firm outperforms rivals.",
    },
    {
      question: "How do firms typically enter foreign markets?",
      options: { A: "Only through exports", B: "Through exports, JVs, or FDI", C: "Only through acquisitions", D: "By hiring local staff" },
      correct: "B",
      explanation: "Firms choose among exporting, joint ventures, licensing, and foreign direct investment based on risk/control tradeoffs.",
    },
  ];
}
