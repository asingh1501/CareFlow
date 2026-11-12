import type { AppointmentSlot, Clinic, DemoState, PatientRow, Provider } from "./types";

export const initialCareRequest = {
  concern: "Persistent cough",
  duration: "4 days",
  details: ["Would like to be checked", "No emergency warning responses entered"],
  format: "In person" as const,
  location: "Bentonville, Arkansas",
  availability: "After 3:00 PM",
  insurance: "Arkansas Blue (demo)",
  accessibility: [] as string[],
  transportationDifficulty: false,
  emergencyWarning: false,
  specialty: "Primary Care",
  radiusMiles: 100,
};

export const initialDemoState: DemoState = {
  bookedSlotId: null,
  preparationComplete: false,
  completedForms: ["reason", "basic", "appointment"],
  waitlistAccepted: false,
  jordanStatus: "Confirmed",
  preferences: {
    location: "Bentonville, AR",
    zipCode: "72712",
    specialty: "Primary Care",
    radiusMiles: 100,
    format: "Either",
    preferredDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    timeRange: "After 3:00 PM",
    accessibility: [],
  },
  favorites: [],
  appointmentRequests: [],
  profile: {
    fullName: "Jordan Lee",
    preferredName: "Jordan",
    dateOfBirth: "1997-01-14",
    email: "jordan@example.demo",
    phone: "(555) 010-0140",
    address: "Bentonville, AR (synthetic demo)",
    emergencyContact: "Taylor Lee · (555) 010-2210 (synthetic)",
    notifications: { email: true, sms: false, reminders: true },
  },
  records: [],
  resolvedTaskIds: [],
  waitlistOfferPatientIds: [],
  reviewedPatientIds: [],
};

export const clinics: Clinic[] = [
  { id: "cl-benton", name: "Ozark Grove Family Clinic", city: "Bentonville", state: "AR", rural: false, accessibility: ["Wheelchair access", "Hearing support"] },
  { id: "cl-rogers", name: "Lakeview Community Health", city: "Rogers", state: "AR", rural: false, accessibility: ["Wheelchair access", "Spanish support"] },
  { id: "cl-fayette", name: "Northwest Primary Care Center", city: "Fayetteville", state: "AR", rural: false, accessibility: ["Wheelchair access", "Vision support"] },
  { id: "cl-spring", name: "Clear Creek Health Access", city: "Springdale", state: "AR", rural: true, accessibility: ["Wheelchair access", "Transportation resources"] },
  { id: "cl-siloam", name: "Siloam Rural Care Hub", city: "Siloam Springs", state: "AR", rural: true, accessibility: ["Wheelchair access", "Language support"] },
];

export const providers: Provider[] = [
  { id: "pr-patel", name: "Dr. Maya Patel", initials: "MP", specialty: "Primary Care" },
  { id: "pr-brooks", name: "Dr. Elias Brooks", initials: "EB", specialty: "Family Medicine" },
  { id: "pr-chen", name: "Dr. Lena Chen", initials: "LC", specialty: "Primary Care" },
  { id: "pr-davis", name: "Dr. Nia Davis", initials: "ND", specialty: "Internal Medicine" },
  { id: "pr-hughes", name: "Casey Hughes, APRN", initials: "CH", specialty: "Same-day Care" },
  { id: "pr-rivera", name: "Dr. Tomás Rivera", initials: "TR", specialty: "Family Medicine" },
];

const baseSlots: Omit<AppointmentSlot, "id">[] = [
  { providerId: "pr-patel", clinicId: "cl-benton", day: "Today", dateLabel: "Sep 4", time: "4:20 PM", hour: 16.33, format: "In person", distance: 2.8, careTypes: ["Routine / primary care", "Same-day care"], insurancePlans: ["Arkansas Blue (demo)", "Sample Health Plan"], newPatients: true, accessible: true, expectedWait: "About 8 min" },
  { providerId: "pr-brooks", clinicId: "cl-rogers", day: "Today", dateLabel: "Sep 4", time: "3:30 PM", hour: 15.5, format: "In person", distance: 5.4, careTypes: ["Routine / primary care", "Same-day care"], insurancePlans: ["Arkansas Blue (demo)"], newPatients: true, accessible: true, expectedWait: "About 12 min" },
  { providerId: "pr-chen", clinicId: "cl-fayette", day: "Today", dateLabel: "Sep 4", time: "5:00 PM", hour: 17, format: "Telehealth", distance: 0, careTypes: ["Routine / primary care", "Telehealth"], insurancePlans: ["Arkansas Blue (demo)", "Sample Health Plan"], newPatients: true, accessible: true, expectedWait: "On time" },
  { providerId: "pr-davis", clinicId: "cl-spring", day: "Tomorrow", dateLabel: "Sep 5", time: "9:40 AM", hour: 9.66, format: "In person", distance: 11.2, careTypes: ["Routine / primary care"], insurancePlans: ["Arkansas Blue (demo)"], newPatients: false, accessible: true, expectedWait: "About 5 min" },
  { providerId: "pr-hughes", clinicId: "cl-benton", day: "Tomorrow", dateLabel: "Sep 5", time: "2:00 PM", hour: 14, format: "In person", distance: 2.8, careTypes: ["Same-day care", "Urgent care", "Routine / primary care"], insurancePlans: ["Arkansas Blue (demo)"], newPatients: true, accessible: true, expectedWait: "About 10 min" },
];

export const appointmentSlots: AppointmentSlot[] = Array.from({ length: 24 }, (_, index) => {
  if (index < baseSlots.length) return { ...baseSlots[index], id: `slot-${index + 1}` };
  const provider = providers[index % providers.length];
  const clinic = clinics[index % clinics.length];
  const hour = 8 + (index % 9);
  return {
    id: `slot-${index + 1}`,
    providerId: provider.id,
    clinicId: clinic.id,
    day: index < 12 ? "Tomorrow" : "This week",
    dateLabel: index < 12 ? "Sep 5" : `Sep ${6 + (index % 4)}`,
    time: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`,
    hour,
    format: index % 4 === 0 ? "Telehealth" : "In person",
    distance: index % 4 === 0 ? 0 : 3.5 + (index % 8) * 1.7,
    careTypes: index % 3 === 0 ? ["Same-day care", "Routine / primary care"] : ["Routine / primary care"],
    insurancePlans: index % 5 === 0 ? ["Sample Health Plan"] : ["Arkansas Blue (demo)", "Sample Health Plan"],
    newPatients: index % 6 !== 0,
    accessible: index % 7 !== 0,
    expectedWait: `About ${5 + (index % 4) * 4} min`,
  };
});

export const patients: PatientRow[] = [
  { id: "jordan", name: "Jordan Lee", initials: "JL", time: "4:20 PM", provider: "Dr. Maya Patel", reason: "Persistent cough", intake: "Complete", forms: "3 of 7", status: "Confirmed" },
  { id: "avery", name: "Avery Morgan", initials: "AM", time: "8:30 AM", provider: "Dr. Lena Chen", reason: "Follow-up visit", intake: "Complete", forms: "7 of 7", status: "Ready" },
  { id: "samira", name: "Samira Bell", initials: "SB", time: "9:10 AM", provider: "Dr. Elias Brooks", reason: "New patient visit", intake: "Needs Review", forms: "5 of 7", status: "Needs Review" },
  { id: "noah", name: "Noah Williams", initials: "NW", time: "10:40 AM", provider: "Dr. Nia Davis", reason: "Medication discussion", intake: "Complete", forms: "4 of 7", status: "Missing Forms" },
  { id: "mina", name: "Mina Shah", initials: "MS", time: "11:20 AM", provider: "Casey Hughes, APRN", reason: "Same-day concern", intake: "Complete", forms: "7 of 7", status: "Ready" },
  { id: "liam", name: "Liam Grant", initials: "LG", time: "1:00 PM", provider: "Dr. Maya Patel", reason: "Annual visit", intake: "Complete", forms: "7 of 7", status: "Ready" },
  { id: "elena", name: "Elena Torres", initials: "ET", time: "1:40 PM", provider: "Dr. Tomás Rivera", reason: "Follow-up visit", intake: "In progress", forms: "2 of 7", status: "Waiting" },
  { id: "owen", name: "Owen Reed", initials: "OR", time: "2:30 PM", provider: "Dr. Elias Brooks", reason: "General concern", intake: "Complete", forms: "6 of 7", status: "Confirmed" },
  { id: "riley", name: "Riley Kim", initials: "RK", time: "3:15 PM", provider: "Dr. Lena Chen", reason: "Telehealth follow-up", intake: "Complete", forms: "7 of 7", status: "Ready" },
  { id: "harper", name: "Harper Jones", initials: "HJ", time: "5:00 PM", provider: "Dr. Nia Davis", reason: "New concern", intake: "Needs Review", forms: "3 of 7", status: "Needs Review" },
];

export const staffTasks = [
  { id: "t1", label: "Missing forms", detail: "3 patients need a preparation reminder", priority: "medium" },
  { id: "t2", label: "Insurance verification", detail: "1 profile has incomplete plan information", priority: "medium" },
  { id: "t3", label: "Awaiting confirmation", detail: "2 appointments need a supportive confirmation", priority: "low" },
  { id: "t4", label: "Open cancellation slot", detail: "3 eligible patients identified for tomorrow at 2:00 PM", priority: "high" },
  { id: "t5", label: "Accessibility review", detail: "Transportation support requested for 1 visit", priority: "medium" },
];

export const waitlistEntries = [
  { patient: "Elena Torres", requested: "Earlier than Sep 10", match: "96%", distance: "4.1 mi", available: "Afternoons" },
  { patient: "Owen Reed", requested: "Any earlier opening", match: "89%", distance: "7.3 mi", available: "After 1 PM" },
  { patient: "Riley Kim", requested: "This week", match: "82%", distance: "Telehealth", available: "Flexible" },
  { patient: "Harper Jones", requested: "Within 3 days", match: "74%", distance: "12.2 mi", available: "Mornings" },
];
