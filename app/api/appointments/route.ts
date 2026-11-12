import { NextRequest, NextResponse } from "next/server";
import { navigateCare } from "@/lib/ai/care-navigation";
import { rankAppointments } from "@/lib/scheduling/match";
import type { CareRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: { careRequest?: CareRequest };
  try { body = await request.json() as { careRequest?: CareRequest }; }
  catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body.careRequest) return NextResponse.json({ error: "careRequest is required" }, { status: 400 });
  const navigation = navigateCare(body.careRequest);
  if (navigation.urgent) return NextResponse.json({ appointments: [], navigation }, { status: 422 });
  return NextResponse.json({ appointments: rankAppointments(body.careRequest, navigation.category), navigation });
}
