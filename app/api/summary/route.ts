import { NextRequest, NextResponse } from "next/server";
import { buildPreVisitSummary } from "@/lib/ai/pre-visit-summary";
import type { CareRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json() as { careRequest?: CareRequest };
  if (!body.careRequest) return NextResponse.json({ error: "careRequest is required" }, { status: 400 });
  return NextResponse.json({ brief: buildPreVisitSummary(body.careRequest), mode: process.env.OPENAI_API_KEY ? "live-ai-available" : "deterministic-demo" });
}
