"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeaderBig } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { COURSES, loadAssignments, daysUntil } from "@/lib/data";
import { useSettings } from "@/lib/settings";
import type { Assignment } from "@/lib/types";

export default function CoursesPage() {
  const [list, setList] = useState<Assignment[]>([]);
  const [mounted, setMounted] = useState(false);
  const [settings] = useSettings();
  const threshold = settings.urgentThreshold;

  useEffect(() => {
    loadAssignments().then((l) => {
      setList(l);
      setMounted(true);
    });
  }, []);

  return (
    <div className="screen">
      <HeaderBig title="COURSES" subtitle="GMBA · ZJU · SPRING 2026" />

      <div className="course-list">
        <div className="course-grid-2x3">
          {COURSES.map((c) => {
            const open = list.filter(
              (a) => a.courseId === c.id && a.status !== "DONE" && a.status !== "SUBMITTED"
            );
            const urgent = open.filter((a) => {
              const d = daysUntil(a.dueDate);
              return d >= 0 && d <= threshold;
            }).length;

            const profName = settings.professors[c.id] || c.professor.replace(/^Prof\.?\s*/i, "");
            const lastName = (profName.split(/\s+/).pop() || "").toUpperCase();

            return (
              <Link key={c.id} href={`/courses/${c.id}`} className="cx-card">
                <div className="cx-top">
                  <span className="cx-code" style={{ color: c.color }}>{c.shortName}</span>
                  {mounted && urgent > 0 && (
                    <span className="cx-urgent">⚡ {urgent} DUE</span>
                  )}
                </div>
                <div className="cx-name">{c.name}</div>
                <div className="cx-prof">{lastName || "—"}</div>
              </Link>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
