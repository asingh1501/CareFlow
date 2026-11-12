export type DirectoryFormat = "In person" | "Telehealth";

export interface DirectoryEntry {
  id: string;
  name: string;
  kind: "Physician" | "Clinic" | "Hospital";
  specialty: string;
  facilityName: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  formats: DirectoryFormat[];
  accessibility: string[];
  schedulingMethod: "Demo appointment request" | "Contact facility externally";
  dataSource: "synthetic-demo";
}

// Deliberately synthetic entries located at approximate city centroids. They test
// cross-state distance behavior without implying live identity, affiliation,
// accepting-patient status, insurance participation, or availability.
export const demoDirectory: DirectoryEntry[] = [
  { id: "demo-benton-primary", name: "Dr. Morgan Avery (Demo)", kind: "Physician", specialty: "Primary Care", facilityName: "Benton Care Center (Demo)", city: "Bentonville", state: "AR", latitude: 36.3729, longitude: -94.2088, formats: ["In person", "Telehealth"], accessibility: ["Wheelchair access"], schedulingMethod: "Demo appointment request", dataSource: "synthetic-demo" },
  { id: "demo-fayette-derm", name: "Northwest Skin Clinic (Demo)", kind: "Clinic", specialty: "Dermatology", facilityName: "Northwest Skin Clinic (Demo)", city: "Fayetteville", state: "AR", latitude: 36.0626, longitude: -94.1574, formats: ["In person"], accessibility: ["Wheelchair access"], schedulingMethod: "Demo appointment request", dataSource: "synthetic-demo" },
  { id: "demo-spring-cardio", name: "Ozark Heart Group (Demo)", kind: "Clinic", specialty: "Cardiology", facilityName: "Ozark Heart Group (Demo)", city: "Springdale", state: "AR", latitude: 36.1867, longitude: -94.1288, formats: ["In person", "Telehealth"], accessibility: ["Wheelchair access", "Interpreter upon request"], schedulingMethod: "Demo appointment request", dataSource: "synthetic-demo" },
  { id: "demo-fortsmith-neuro", name: "River Valley Neurology (Demo)", kind: "Clinic", specialty: "Neurology", facilityName: "River Valley Neurology (Demo)", city: "Fort Smith", state: "AR", latitude: 35.3859, longitude: -94.3985, formats: ["In person"], accessibility: ["Wheelchair access"], schedulingMethod: "Demo appointment request", dataSource: "synthetic-demo" },
  { id: "demo-joplin-cardio", name: "Joplin Regional Cardiology (Demo)", kind: "Clinic", specialty: "Cardiology", facilityName: "Joplin Regional Cardiology (Demo)", city: "Joplin", state: "MO", latitude: 37.0842, longitude: -94.5133, formats: ["In person"], accessibility: ["Wheelchair access"], schedulingMethod: "Demo appointment request", dataSource: "synthetic-demo" },
  { id: "demo-joplin-ortho", name: "Four States Orthopedics (Demo)", kind: "Clinic", specialty: "Orthopedics", facilityName: "Four States Orthopedics (Demo)", city: "Joplin", state: "MO", latitude: 37.0712, longitude: -94.5011, formats: ["In person", "Telehealth"], accessibility: ["Wheelchair access"], schedulingMethod: "Demo appointment request", dataSource: "synthetic-demo" },
  { id: "demo-joplin-hospital", name: "Four State General Hospital (Demo)", kind: "Hospital", specialty: "Primary Care", facilityName: "Four State General Hospital (Demo)", city: "Joplin", state: "MO", latitude: 37.0738, longitude: -94.5112, formats: ["In person"], accessibility: ["Wheelchair access", "Interpreter upon request"], schedulingMethod: "Contact facility externally", dataSource: "synthetic-demo" },
  { id: "demo-tahlequah-derm", name: "Cherokee Hills Dermatology (Demo)", kind: "Clinic", specialty: "Dermatology", facilityName: "Cherokee Hills Dermatology (Demo)", city: "Tahlequah", state: "OK", latitude: 35.9154, longitude: -94.9699, formats: ["In person", "Telehealth"], accessibility: ["Wheelchair access"], schedulingMethod: "Demo appointment request", dataSource: "synthetic-demo" },
  { id: "demo-tulsa-endocrine", name: "Tulsa Endocrine Center (Demo)", kind: "Clinic", specialty: "Endocrinology", facilityName: "Tulsa Endocrine Center (Demo)", city: "Tulsa", state: "OK", latitude: 36.154, longitude: -95.9928, formats: ["In person", "Telehealth"], accessibility: ["Wheelchair access"], schedulingMethod: "Demo appointment request", dataSource: "synthetic-demo" },
  { id: "demo-telehealth-behavioral", name: "CareFlow Telehealth Navigation Demo", kind: "Clinic", specialty: "Behavioral Health", facilityName: "Virtual care (Demo)", city: "Virtual", state: "US", latitude: 0, longitude: 0, formats: ["Telehealth"], accessibility: ["Captioning supported"], schedulingMethod: "Demo appointment request", dataSource: "synthetic-demo" },
];

export const specialties = Array.from(new Set(demoDirectory.map((entry) => entry.specialty))).sort();
