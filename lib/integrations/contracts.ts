export interface CalendarAdapter { listAvailability(clinicId: string): Promise<unknown[]>; holdSlot(slotId: string): Promise<string>; }
export interface EligibilityAdapter { verifyMember(memberId: string, planId: string): Promise<{ eligible: boolean; note?: string }>; }
export interface NotificationAdapter { sendReminder(recipientId: string, templateId: string): Promise<void>; }
export interface FhirAdapter { exportPreVisitBundle(patientId: string): Promise<Record<string, unknown>>; }

export const prototypeIntegrations = {
  calendar: "Deterministic demo availability",
  eligibility: "Sample compatibility rules",
  notifications: "In-app simulated delivery",
  healthRecord: "Structured export boundary only",
} as const;
