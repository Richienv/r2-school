import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const SummarySchema = z.object({
  keyConcepts: z.array(z.string()).min(3).max(5),
  whatToRemember: z.string(),
  examTopics: z.array(z.string()).min(2).max(4),
});

const SYSTEM_PROMPT = `You are an academic assistant for an MBA student.
Analyze the provided lecture content and extract:
1. 3-5 key concepts as clear, concise bullet points
2. A 2-sentence "what to remember" summary in plain English
3. 2-3 likely exam/assignment topics`;

export async function POST(req: Request) {
  try {
    const { content, course, date } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length < 10) {
      return NextResponse.json({ error: "Content too short" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("[catchup] ANTHROPIC_API_KEY not set");
      return NextResponse.json({ error: "AI not configured" }, { status: 500 });
    }

    const { object } = await generateObject({
      model: anthropic("claude-4-sonnet-20250514"),
      schema: SummarySchema,
      system: SYSTEM_PROMPT,
      prompt: `Course: ${course ?? "Unknown"}\nDate: ${date ?? "Unknown"}\n\nLecture content:\n${content}`,
    });

    return NextResponse.json(object);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[catchup] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
