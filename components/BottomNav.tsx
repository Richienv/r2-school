"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const OS_URL = "https://r2-os.vercel.app";

const LEFT = [
  { href: "/", label: "HOME" },
  { href: "/timeline", label: "TIMELINE" },
];

const RIGHT = [
  { href: "/practice", label: "PRACTICE" },
  { href: "/settings", label: "SET" },
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
          {item.label}
        </Link>
      ))}

      <div className="bnav-center">
        <button
          className="os-btn"
          onClick={() => (window.location.href = OS_URL)}
          onTouchStart={(e) => {
            e.currentTarget.style.transform = "translateY(-12px) scale(0.92)";
            e.currentTarget.style.boxShadow = "0 -2px 6px rgba(0,0,0,0.15)";
          }}
          onTouchEnd={(e) => {
            e.currentTarget.style.transform = "translateY(-12px) scale(1)";
            e.currentTarget.style.boxShadow = "0 -4px 16px rgba(0,0,0,0.25)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "translateY(-12px) scale(0.92)";
            e.currentTarget.style.boxShadow = "0 -2px 6px rgba(0,0,0,0.15)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(-12px) scale(1)";
            e.currentTarget.style.boxShadow = "0 -4px 16px rgba(0,0,0,0.25)";
          }}
        >
          OS
        </button>
      </div>

      {RIGHT.map((item) => (
        <Link key={item.href} href={item.href} className={`bnav-item ${isActive(item.href) ? "active" : ""}`}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
