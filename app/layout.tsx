import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono, Oswald } from "next/font/google";
import "./globals.css";

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const display = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "R2·SCHOOL",
  description: "Know what's due. Know what matters.",
};

export const viewport: Viewport = {
  themeColor: "#03080F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${body.variable} ${mono.variable} ${display.variable}`}>
      <body>
        <div className="app">{children}</div>
      </body>
    </html>
  );
}
