"use client";

export function Header({ title = "R2·SCHOOL", showDot = true }: { title?: string; showDot?: boolean }) {
  const now = new Date();
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dateStr = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}`;

  return (
    <div className="header">
      <div className="logo">
        {title}
        {showDot && <span className="logo-dot" />}
      </div>
      <div className="date">{dateStr}</div>
    </div>
  );
}

export function HeaderBig({ title, subtitle }: { title: string; subtitle?: string }) {
  const now = new Date();
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dateStr = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}`;

  return (
    <div className="header-big">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="title">
          {title}
          <span className="dot" />
        </div>
        <div className="date" style={{ marginTop: 6 }}>{dateStr}</div>
      </div>
      {subtitle && <div className="label" style={{ marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}
