import { containsEmergencyWarning } from "./intake-extraction";

export interface SafetyInterruption { urgent: true; message: string }

export function detectSafetyInterruption(message: string): SafetyInterruption | null {
  if (!containsEmergencyWarning(message)) return null;
  return {
    urgent: true,
    message: "Your message includes a warning sign that CareFlow cannot safely evaluate. If you may be experiencing an emergency, call local emergency services or go to the nearest emergency department now. Do not wait for this chat. CareFlow will pause automated scheduling for this request.",
  };
}
