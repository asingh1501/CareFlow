import type { CareRequest } from "../types";
import { detectMissingInformation } from "./missing-information";

export interface PreVisitBrief {
  summary: string;
  safetyStatement: string;
  missing: string[];
}

export function buildPreVisitSummary(request: CareRequest): PreVisitBrief {
  return {
    summary: `Patient reports ${request.concern.toLowerCase()} for ${request.duration.toLowerCase()}. Patient prefers ${request.format.toLowerCase()} care in the ${request.location.replace(", Arkansas", "")} area and is available ${request.availability.toLowerCase()}.`,
    safetyStatement: request.emergencyWarning
      ? "An emergency warning response was entered; professional review is required."
      : "No emergency warning responses were entered during CareFlow intake.",
    missing: detectMissingInformation(request),
  };
}
