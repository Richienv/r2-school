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
      <div className="scroll-area" style={{ padding: 20 }}>
        <div className="label">ABOUT</div>
        <div style={{ margin: "8px 0 24px", color: "var(--text-dim)", fontSize: 13 }}>
          R2·SCHOOL — part of the R2·OS ecosystem.<br />
          Know what&apos;s due. Know what matters.
        </div>

        <div className="label">DATA</div>
        <button className="ghost-btn" onClick={reset}>RESET ALL DATA</button>
      </div>
      <BottomNav />
    </div>
  );
}
