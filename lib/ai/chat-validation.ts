export interface ChatMessage { role: "user" | "assistant"; content: string }

export function validateChatMessages(value: unknown): { messages?: ChatMessage[]; error?: string } {
  if (!Array.isArray(value) || value.length === 0) return { error: "At least one message is required." };
  if (value.length > 20) return { error: "Conversation history is limited to 20 messages." };
  const messages: ChatMessage[] = [];
  let total = 0;
  for (const entry of value) {
    if (!entry || typeof entry !== "object") return { error: "Invalid message format." };
    const candidate = entry as Record<string, unknown>;
    if (candidate.role !== "user" && candidate.role !== "assistant") return { error: "Message role must be user or assistant." };
    if (typeof candidate.content !== "string" || !candidate.content.trim()) return { error: "Message content is required." };
    if (candidate.content.length > 4000) return { error: "Each message is limited to 4,000 characters." };
    total += candidate.content.length;
    messages.push({ role: candidate.role, content: candidate.content.trim() });
  }
  if (total > 12000) return { error: "Conversation content is too large." };
  if (messages.at(-1)?.role !== "user") return { error: "The final message must be from the user." };
  return { messages };
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
export function checkRateLimit(key: string, now = Date.now(), limit = 12, windowMs = 60_000): { allowed: boolean; retryAfterSeconds: number } {
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= limit) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetRateLimitsForTests() { rateBuckets.clear(); }
