import type { CareRequest, NavigationCategory } from "../types";

export interface NavigationResult {
  category: NavigationCategory;
  title: string;
  explanation: string;
  urgent: boolean;
}

export function navigateCare(request: CareRequest): NavigationResult {
  if (request.emergencyWarning) {
    return {
      category: "Needs human review",
      title: "Immediate professional attention",
      explanation: "Based on what you entered, this request requires immediate professional attention. CareFlow cannot evaluate emergencies.",
      urgent: true,
    };
  }

  if (request.format === "Telehealth") {
    return {
      category: "Telehealth",
      title: "Telehealth visit",
      explanation: "Based on your visit-format preference, CareFlow can help you find a telehealth appointment. A healthcare professional will determine any diagnosis or treatment.",
      urgent: false,
    };
  }

  if (request.specialty && request.specialty !== "Primary Care") {
    return {
      category: "Specialist / referral review",
      title: `${request.specialty} care search`,
      explanation: `CareFlow can help search for ${request.specialty.toLowerCase()} providers and facilities within your travel preferences. A licensed professional or health plan may need to confirm whether a referral is required.`,
      urgent: false,
    };
  }

  return {
    category: "Routine / primary care",
    title: "Primary care visit",
    explanation: "Based on the information you provided, CareFlow can help you find a primary care appointment. A healthcare professional will determine any diagnosis or treatment.",
    urgent: false,
  };
}
