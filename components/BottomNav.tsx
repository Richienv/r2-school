"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const OS_URL = "https://r2-os.vercel.app";

function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
    </svg>
  );
}

function IconBrain() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3a3 3 0 0 0-3 3v12a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z" />
      <path d="M10 6a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6 3 3 0 0 0 3 3" />
      <path d="M16 6a3 3 0 0 1 3 3v1a3 3 0 0 1 0 6 3 3 0 0 1-3 3" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

const LEFT: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/", label: "HOME", icon: <IconHome /> },
  { href: "/courses", label: "COURSE", icon: <IconBook /> },
];

const RIGHT: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/learn", label: "LEARN", icon: <IconBrain /> },
  { href: "/settings", label: "SET", icon: <IconSettings /> },
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
          <span className="bnav-icon">{item.icon}</span>
          <span className="bnav-label">{item.label}</span>
        </Link>
      ))}

      <div className="bnav-center">
        <button className="os-btn" onClick={() => (window.location.href = OS_URL)}>OS</button>
      </div>

      {RIGHT.map((item) => (
        <Link key={item.href} href={item.href} className={`bnav-item ${isActive(item.href) ? "active" : ""}`}>
          <span className="bnav-icon">{item.icon}</span>
          <span className="bnav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
