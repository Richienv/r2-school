"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

export default function SettingsPage() {
  function reset() {
    if (!confirm("Reset all local data? This cannot be undone.")) return;
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <div className="screen">
      <Header title="SETTINGS" />
      <div className="scroll-list" style={{ padding: 20 }}>
        <div className="label">ABOUT</div>
        <div style={{ margin: "8px 0 24px", color: "var(--muted)", fontSize: 12 }}>
          R2·SCHOOL — part of the R2·OS ecosystem.<br />
          Know what's due. Know what matters.
        </div>

        <div className="label">DATA</div>
        <button className="ghost-btn" onClick={reset}>RESET ALL DATA</button>
      </div>
      <BottomNav />
    </div>
  );
}
