import type { CareRequest } from "../types";

const durationPattern = /(\d+|one|two|three|four|five|six|seven)\s+(hour|day|week|month)s?/i;

export function extractIntake(message: string, current: CareRequest): CareRequest {
  const text = message.toLowerCase();
  const duration = message.match(durationPattern)?.[0];
  const concern = detectConcern(text) ?? (current.concern || sentenceCase(message.slice(0, 70)));
  return {
    ...current,
    concern,
    duration: duration ?? current.duration,
    format: /video|virtual|telehealth|phone/.test(text) ? "Telehealth" : current.format,
    location: detectLocation(text) ?? current.location,
    availability: detectAvailability(text) ?? current.availability,
    transportationDifficulty: /no ride|transportation|cannot drive|can't drive/.test(text),
    emergencyWarning: containsEmergencyWarning(text),
  };
}

export function containsEmergencyWarning(text: string): boolean {
  const normalized = text.toLowerCase();
  return [
    /severe chest pain/,
    /can't breathe|cannot breathe|not breathing/,
    /signs of (a )?stroke/,
    /face droop|slurred speech/,
    /heavy bleeding|won't stop bleeding/,
    /passed out|unconscious/,
    /suicid(e|al)|kill myself|harm myself/,
  ].some((rule) => rule.test(normalized));
}

function detectConcern(text: string): string | null {
  const concerns: [RegExp, string][] = [
    [/cough/, "Persistent cough"],
    [/headache|migraine/, "Headache"],
    [/rash/, "Skin concern"],
    [/follow.?up/, "Follow-up visit"],
    [/refill|medication/, "Medication discussion"],
    [/check.?up|annual/, "Routine check-up"],
  ];
  return concerns.find(([pattern]) => pattern.test(text))?.[1] ?? null;
}

function detectLocation(text: string): string | null {
  const places = ["Bentonville", "Rogers", "Fayetteville", "Springdale", "Siloam Springs"];
  const match = places.find((place) => text.includes(place.toLowerCase()));
  return match ? `${match}, Arkansas` : null;
}

function detectAvailability(text: string): string | null {
  if (/after\s*3|afternoon|evening/.test(text)) return "After 3:00 PM";
  if (/morning|before noon/.test(text)) return "Morning";
  if (/any ?time|flexible/.test(text)) return "Flexible";
  return null;
}

function sentenceCase(value: string): string {
  const clean = value.trim();
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : "";
}
