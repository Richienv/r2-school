"use client";

import { HeaderBig } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

export default function SettingsPage() {
  function reset() {
    if (!confirm("Reset all local data? This cannot be undone.")) return;
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <div className="screen">
      <HeaderBig title="SETTINGS" />
      <div className="scroll-area" style={{ padding: 16 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: 3, color: "var(--text-muted)" }}>ABOUT</div>
        <div style={{ margin: "8px 0 24px", color: "var(--text-dim)", fontSize: 13 }}>
          R2·SCHOOL — part of the R2·OS ecosystem.<br />
          Know what&apos;s due. Know what matters.
        </div>

        <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: 3, color: "var(--text-muted)" }}>DATA</div>
        <button className="ghost-btn" onClick={reset}>RESET ALL DATA</button>
      </div>
      <BottomNav />
    </div>
  );
}
