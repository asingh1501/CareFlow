import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { initialCareRequest, initialDemoState } from "@/lib/demo-data";

const schemaSql = `CREATE TABLE IF NOT EXISTS demo_state (id TEXT PRIMARY KEY, payload TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`;

async function ensureTable() { await env.DB.prepare(schemaSql).run(); }

export async function GET() {
  await ensureTable();
  const row = await env.DB.prepare("SELECT payload FROM demo_state WHERE id = ?").bind("main").first<{ payload: string }>();
  return NextResponse.json(row ? JSON.parse(row.payload) : { careRequest: initialCareRequest, demoState: initialDemoState });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  await ensureTable();
  await env.DB.prepare("INSERT INTO demo_state (id, payload, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = CURRENT_TIMESTAMP").bind("main", JSON.stringify(payload)).run();
  await env.DB.prepare("INSERT INTO audit_logs (id, action, resource_type, resource_id, metadata_json) VALUES (?, ?, ?, ?, ?)").bind(crypto.randomUUID(), "demo_state.updated", "demo_state", "main", JSON.stringify({ prototype: true })).run().catch(() => undefined);
  return NextResponse.json({ ok: true });
}
