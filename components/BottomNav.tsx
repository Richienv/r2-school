"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "HOME" },
  { href: "/timeline", label: "TIMELINE" },
  { href: "/practice", label: "PRACTICE" },
  { href: "/settings", label: "SET" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => {
        const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={`nav-btn ${active ? "active" : ""}`}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
