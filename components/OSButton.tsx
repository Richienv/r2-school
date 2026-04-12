"use client";

const OS_URL = "https://r2-os.vercel.app";

export default function OSButton() {
  return (
    <button
      onClick={() => (window.location.href = OS_URL)}
      onTouchStart={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(0.95)")}
      onTouchEnd={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1)")}
      onMouseDown={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(0.95)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1)")}
      style={{
        position: "fixed",
        bottom: 72,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99,
        width: 80,
        height: 32,
        borderRadius: 999,
        background: "#FFFFFF",
        color: "#1515E0",
        border: "none",
        cursor: "pointer",
        fontFamily: "Impact, 'Arial Narrow', sans-serif",
        fontSize: 14,
        letterSpacing: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
        transition: "transform 100ms, background 100ms",
        userSelect: "none",
        padding: 0,
      }}
    >
      OS
    </button>
  );
}
