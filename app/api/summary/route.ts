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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threshold = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    const urgent = await prisma.assignment.findMany({
      where: {
        status: { not: "DONE" },
        dueDate: { lte: threshold },
      },
      orderBy: { dueDate: "asc" },
    });

    const summary = {
      metric: urgent.length.toString(),
      unit: "DUE",
      label: urgent.length === 0 ? "no urgent tasks" : "within 3 days",
      alert: urgent.length > 0,
      alertMessage: urgent[0]?.title ?? "",
      urgency: urgent.length > 0 ? "urgent" : "info",
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
