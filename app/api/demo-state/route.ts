import { NextRequest, NextResponse } from "next/server";
import { initialCareRequest, initialDemoState } from "@/lib/demo-data";

type StoredDemo = {
  careRequest: typeof initialCareRequest;
  demoState: typeof initialDemoState;
};

// Portable demo persistence for credential-free deployments. The browser also
// mirrors presentation state locally. A production adapter would write to
// Supabase/D1 behind authenticated, role-scoped server access.
const globalStore = globalThis as typeof globalThis & { careflowDemoState?: StoredDemo };

export async function GET() {
  return NextResponse.json(globalStore.careflowDemoState ?? {
    careRequest: initialCareRequest,
    demoState: initialDemoState,
  });
}

export async function POST(request: NextRequest) {
  globalStore.careflowDemoState = await request.json() as StoredDemo;
  return NextResponse.json({ ok: true, persistence: "prototype-runtime" });
}
