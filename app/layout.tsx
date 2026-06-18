import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServerSync } from "./ServerSync";

export const metadata: Metadata = {
  title: "R2·SCHOOL",
  description: "Know what's due. Know what matters.",
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ServerSync />
        <div className="app">
          {children}
        </div>
      </body>
    </html>
  );
}
