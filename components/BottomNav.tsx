"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const OS_URL = "https://r2-os.vercel.app";

const LEFT: { href: string; label: string; emoji: string }[] = [
  { href: "/", label: "HOME", emoji: "🏠" },
  { href: "/courses", label: "COURSE", emoji: "📚" },
];

const RIGHT: { href: string; label: string; emoji: string }[] = [
  { href: "/learn", label: "LEARN", emoji: "🧠" },
  { href: "/settings", label: "SET", emoji: "⚙️" },
];

export function BottomNav() {
  const path = usePathname();

  function isActive(href: string) {
    return href === "/" ? path === "/" : path.startsWith(href);
  }

  return (
    <nav className="bnav">
      {LEFT.map((item) => (
        <Link key={item.href} href={item.href} className={`bnav-item ${isActive(item.href) ? "active" : ""}`}>
          <span className="bnav-icon" aria-hidden>{item.emoji}</span>
          <span className="bnav-label">{item.label}</span>
        </Link>
      ))}

      <div className="bnav-center">
        <button className="os-btn" onClick={() => (window.location.href = OS_URL)}>OS</button>
      </div>

      {RIGHT.map((item) => (
        <Link key={item.href} href={item.href} className={`bnav-item ${isActive(item.href) ? "active" : ""}`}>
          <span className="bnav-icon" aria-hidden>{item.emoji}</span>
          <span className="bnav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
