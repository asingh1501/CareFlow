import { appointmentSlots, clinics, providers } from "../demo-data";
import type { AppointmentSlot, CareRequest, NavigationCategory, RankedAppointment } from "../types";

function clamp(value: number): number { return Math.max(0, Math.min(100, Math.round(value))); }

export function scoreAppointment(slot: AppointmentSlot, request: CareRequest, category: NavigationCategory): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  if (slot.careTypes.includes(category) || slot.careTypes.includes("Routine / primary care")) { score += 28; reasons.push("Right visit type"); }
  if (request.availability.includes("After 3") && slot.hour >= 15) { score += 18; reasons.push("Fits your preferred time"); }
  else if (request.availability === "Flexible") score += 14;
  if (slot.format === request.format) { score += 13; reasons.push(request.format === "Telehealth" ? "Telehealth preference" : "Preferred visit format"); }
  if (slot.insurancePlans.includes(request.insurance)) { score += 15; reasons.push("Insurance match"); }
  if (slot.distance === 0) score += 12;
  else if (slot.distance <= 3) { score += 12; reasons.push("Close to you"); }
  else if (slot.distance <= 8) score += 8;
  else score += 3;
  if (slot.day === "Today") { score += 10; reasons.push("Available today"); }
  else if (slot.day === "Tomorrow") score += 7;
  if (request.accessibility.length === 0 || slot.accessible) { score += 4; if (request.accessibility.length) reasons.push("Accessibility match"); }
  return { score: clamp(score), reasons: reasons.slice(0, 4) };
}

export function rankAppointments(request: CareRequest, category: NavigationCategory): RankedAppointment[] {
  const ranked = appointmentSlots.map((slot) => {
    const scored = scoreAppointment(slot, request, category);
    return {
      ...slot,
      ...scored,
      provider: providers.find((provider) => provider.id === slot.providerId)!,
      clinic: clinics.find((clinic) => clinic.id === slot.clinicId)!,
      label: "Strong Match" as RankedAppointment["label"],
    };
  }).sort((a, b) => b.score - a.score).slice(0, 5);

  return ranked.map((slot, index) => ({
    ...slot,
    label: index === 0 ? "Best Match" : slot.format === "Telehealth" ? "Telehealth" : slot.distance <= 3 ? "Closest" : index === 1 ? "Earliest" : "Strong Match",
  }));
}
