import type { CareRequest } from "../types";

export function detectMissingInformation(request: CareRequest): string[] {
  const missing: string[] = [];
  if (!request.concern) missing.push("reason for visit");
  if (!request.duration) missing.push("duration");
  if (!request.location) missing.push("preferred location");
  if (!request.availability) missing.push("availability");
  if (!request.insurance) missing.push("insurance information (optional)");
  return missing;
}
