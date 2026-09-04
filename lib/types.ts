export type Role = "patient" | "staff" | "provider";
export type VisitFormat = "In person" | "Telehealth";
export type NavigationCategory =
  | "Routine / primary care"
  | "Same-day care"
  | "Urgent care"
  | "Telehealth"
  | "Specialist / referral review"
  | "Needs human review";

export interface CareRequest {
  concern: string;
  duration: string;
  details: string[];
  format: VisitFormat;
  location: string;
  availability: string;
  insurance: string;
  preferredProvider?: string;
  accessibility: string[];
  transportationDifficulty: boolean;
  emergencyWarning: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  city: string;
  state: "AR";
  rural: boolean;
  accessibility: string[];
}

export interface Provider {
  id: string;
  name: string;
  initials: string;
  specialty: string;
}

export interface AppointmentSlot {
  id: string;
  providerId: string;
  clinicId: string;
  day: string;
  dateLabel: string;
  time: string;
  hour: number;
  format: VisitFormat;
  distance: number;
  careTypes: NavigationCategory[];
  insurancePlans: string[];
  newPatients: boolean;
  accessible: boolean;
  expectedWait: string;
}

export interface RankedAppointment extends AppointmentSlot {
  score: number;
  label: "Best Match" | "Earliest" | "Closest" | "Telehealth" | "Strong Match";
  reasons: string[];
  provider: Provider;
  clinic: Clinic;
}

export interface DemoState {
  bookedSlotId: string | null;
  preparationComplete: boolean;
  completedForms: string[];
  waitlistAccepted: boolean;
  jordanStatus: "Confirmed" | "Missing Forms" | "Ready";
}

export interface PatientRow {
  id: string;
  name: string;
  initials: string;
  time: string;
  provider: string;
  reason: string;
  intake: "Complete" | "Needs Review" | "In progress";
  forms: string;
  status: "Ready" | "Missing Forms" | "Needs Review" | "Waiting" | "Confirmed";
}
