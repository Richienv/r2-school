"use client";

export function Header({ title = "R2·SCHOOL" }: { title?: string }) {
  const now = new Date();
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const dateStr = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}`;

  return (
    <div className="header">
      <div className="logo">{title}</div>
      <div className="date">{dateStr}</div>
    </div>
  );
}
