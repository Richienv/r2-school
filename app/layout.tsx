import type { Metadata, Viewport } from "next";
import OSButton from "@/components/OSButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "R2·SCHOOL",
  description: "Know what's due. Know what matters.",
};

export const viewport: Viewport = {
  themeColor: "#1515E0",
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
        <div className="app">
          {children}
          <OSButton />
        </div>
      </body>
    </html>
  );
}
