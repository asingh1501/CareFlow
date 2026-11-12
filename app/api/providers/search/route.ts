import { NextRequest, NextResponse } from "next/server";
import { ProviderSearchError, searchProviders } from "@/lib/providers/search";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  try {
    const radiusRaw = params.get("radius");
    const payload = searchProviders({
      zipCode: params.get("zip") || undefined,
      location: params.get("location") || undefined,
      specialty: params.get("specialty") || undefined,
      name: params.get("name") || undefined,
      kind: (params.get("kind") || "All") as "All" | "Physician" | "Clinic" | "Hospital",
      radiusMiles: radiusRaw ? Number(radiusRaw) : 100,
      format: (params.get("format") || "Either") as "In person" | "Telehealth" | "Either",
      sort: params.get("sort") === "name" ? "name" : "distance",
    });
    return NextResponse.json(payload, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof ProviderSearchError) return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    return NextResponse.json({ error: "Provider search is temporarily unavailable.", code: "SEARCH_FAILED" }, { status: 500 });
  }
}
