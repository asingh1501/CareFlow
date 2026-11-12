import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, validateChatMessages } from "@/lib/ai/chat-validation";
import { detectSafetyInterruption } from "@/lib/ai/safety";

const SYSTEM_PROMPT = `You are CareFlow, a healthcare navigation and pre-visit coordination assistant. You are not a clinician and must not diagnose, prescribe, recommend medication changes, or claim certainty. Help the user identify an appropriate care specialty, location, travel radius, timing, in-person/telehealth preference, and access needs. Ask at most one concise follow-up question at a time. When enough information is available, summarize those preferences and direct the user to provider discovery. Never claim a provider is accepting patients, in-network, affiliated with a facility, or has an available appointment unless verified data in the conversation explicitly says so. Minimize repetition of sensitive details. For potential emergencies, do not improvise clinical advice; the server safety layer handles explicit warning phrases.`;

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 32_000) return NextResponse.json({ error: "Request is too large.", code: "REQUEST_TOO_LARGE" }, { status: 413 });
  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("cf-connecting-ip") || "local";
  const rate = checkRateLimit(clientKey);
  if (!rate.allowed) return NextResponse.json({ error: "Too many chat requests. Please wait and try again.", code: "RATE_LIMITED" }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON.", code: "INVALID_JSON" }, { status: 400 }); }
  const checked = validateChatMessages((body as { messages?: unknown })?.messages);
  if (!checked.messages) return NextResponse.json({ error: checked.error, code: "INVALID_REQUEST" }, { status: 400 });

  const safety = detectSafetyInterruption(checked.messages.at(-1)!.content);
  if (safety) return NextResponse.json({ message: safety.message, urgent: true, mode: "deterministic-safety" });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Live CareFlow AI is not configured. Add OPENAI_API_KEY on the server or use the clearly labeled demo navigation mode.", code: "MISSING_CREDENTIALS" }, { status: 503 });

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 20_000, maxRetries: 1 });
  const model = process.env.OPENAI_MODEL || "gpt-5-mini";
  try {
    if (request.headers.get("accept")?.includes("text/plain")) {
      const response = await client.responses.create({ model, instructions: SYSTEM_PROMPT, input: checked.messages, stream: true });
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          let failed = false;
          try {
            for await (const event of response) if (event.type === "response.output_text.delta") controller.enqueue(encoder.encode(event.delta));
          } catch { failed = true; controller.error(new Error("The AI response stream failed.")); }
          finally { if (!failed) controller.close(); }
        },
      });
      return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-careflow-ai-mode": "live" } });
    }
    const response = await client.responses.create({ model, instructions: SYSTEM_PROMPT, input: checked.messages });
    return NextResponse.json({ message: response.output_text, urgent: false, mode: "live", model });
  } catch (error) {
    const status = error instanceof OpenAI.APIError && error.status && error.status >= 400 && error.status < 600 ? error.status : 502;
    return NextResponse.json({ error: status === 401 ? "The configured AI credential was rejected." : "CareFlow AI is temporarily unavailable. Your message was not stored; please retry.", code: "AI_UPSTREAM_ERROR" }, { status: status === 401 ? 503 : 502 });
  }
}
