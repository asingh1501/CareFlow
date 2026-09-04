import { NextRequest, NextResponse } from "next/server";
import { extractIntake } from "@/lib/ai/intake-extraction";
import { navigateCare } from "@/lib/ai/care-navigation";
import { detectMissingInformation } from "@/lib/ai/missing-information";
import type { CareRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json() as { message?: string; current?: CareRequest };
  if (!body.message || !body.current) return NextResponse.json({ error: "message and current request are required" }, { status: 400 });
  const structured = extractIntake(body.message, body.current);
  return NextResponse.json({ structured, navigation: navigateCare(structured), missing: detectMissingInformation(structured), mode: process.env.AI_API_KEY ? "enhanced-ready" : "deterministic-fallback" });
}
