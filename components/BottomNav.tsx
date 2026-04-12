"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "HOME", icon: "◉" },
  { href: "/timeline", label: "TIMELINE", icon: "▦" },
  { href: "/practice", label: "PRACTICE", icon: "✦" },
  { href: "/settings", label: "SET", icon: "⚙" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => {
        const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={`nav-btn ${active ? "active" : ""}`}>
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
