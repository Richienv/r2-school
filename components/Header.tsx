"use client";

export function Header() {
  const now = new Date();
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dateStr = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}`;

  return (
    <div className="header">
      <div className="logo">R2·SCHOOL<span className="logo-dot" /></div>
      <div className="date">{dateStr}</div>
    </div>
  );
}

export function HeaderBig({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="header-big">
      <div className="title">{title}</div>
      {subtitle && <div className="subtitle">{subtitle}</div>}
    </div>
  );
}
