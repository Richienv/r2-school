import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  try {
    const CST_OFFSET_MS = 8 * 60 * 60 * 1000;
    const cstNow = new Date(Date.now() + CST_OFFSET_MS);

    const all = await prisma.assignment.findMany({
      where: { status: { not: "DONE" } },
      orderBy: { dueDate: "asc" },
    });

    const soonest = all[0];
    const daysLeft = soonest
      ? Math.round(
          (soonest.dueDate.getTime() - cstNow.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

    const label =
      daysLeft === null
        ? "all clear"
        : daysLeft <= 0
        ? "TODAY"
        : daysLeft === 1
        ? "TOMORROW"
        : `${daysLeft} DAYS`;

    const urgency: "info" | "warning" | "urgent" =
      daysLeft !== null && daysLeft <= 1
        ? "urgent"
        : daysLeft !== null && daysLeft <= 3
        ? "warning"
        : "info";

    const summary = {
      metric: all.length.toString(),
      unit: "DUE",
      label,
      alert: daysLeft !== null && daysLeft <= 3,
      alertMessage: soonest
        ? `${soonest.courseCode.toUpperCase()} · ${soonest.title}`
        : "",
      urgency,
    };

    return NextResponse.json(summary, { headers: corsHeaders });
  } catch {
    return NextResponse.json(
      {
        metric: "—",
        unit: "",
        label: "unavailable",
        alert: false,
        alertMessage: "",
        urgency: "info",
      },
      { headers: corsHeaders }
    );
  }
}
