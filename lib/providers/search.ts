import { demoDirectory, type DirectoryEntry, type DirectoryFormat } from "./directory";

export interface Coordinates { latitude: number; longitude: number; label: string }
export interface ProviderSearchInput {
  zipCode?: string;
  location?: string;
  specialty?: string;
  name?: string;
  kind?: DirectoryEntry["kind"] | "All";
  radiusMiles?: number;
  format?: DirectoryFormat | "Either";
  sort?: "distance" | "name";
}
export interface ProviderSearchResult extends DirectoryEntry {
  distanceMiles: number | null;
  matchReasons: string[];
}

const places: Record<string, Coordinates> = {
  "72701": { latitude: 36.0626, longitude: -94.1574, label: "Fayetteville, AR 72701" },
  "72712": { latitude: 36.3729, longitude: -94.2088, label: "Bentonville, AR 72712" },
  "72761": { latitude: 36.1881, longitude: -94.5405, label: "Siloam Springs, AR 72761" },
  "64801": { latitude: 37.0842, longitude: -94.5133, label: "Joplin, MO 64801" },
  "74464": { latitude: 35.9154, longitude: -94.9699, label: "Tahlequah, OK 74464" },
  "72901": { latitude: 35.3859, longitude: -94.3985, label: "Fort Smith, AR 72901" },
  "74103": { latitude: 36.154, longitude: -95.9928, label: "Tulsa, OK 74103" },
  "fayetteville, ar": { latitude: 36.0626, longitude: -94.1574, label: "Fayetteville, AR" },
  "fayetteville, arkansas": { latitude: 36.0626, longitude: -94.1574, label: "Fayetteville, AR" },
  "bentonville, ar": { latitude: 36.3729, longitude: -94.2088, label: "Bentonville, AR" },
  "bentonville, arkansas": { latitude: 36.3729, longitude: -94.2088, label: "Bentonville, AR" },
  "siloam springs, ar": { latitude: 36.1881, longitude: -94.5405, label: "Siloam Springs, AR" },
  "joplin, mo": { latitude: 37.0842, longitude: -94.5133, label: "Joplin, MO" },
  "tahlequah, ok": { latitude: 35.9154, longitude: -94.9699, label: "Tahlequah, OK" },
  "fort smith, ar": { latitude: 35.3859, longitude: -94.3985, label: "Fort Smith, AR" },
  "tulsa, ok": { latitude: 36.154, longitude: -95.9928, label: "Tulsa, OK" },
};

export class ProviderSearchError extends Error {
  constructor(public code: "INVALID_ZIP" | "GEOCODING_FAILED" | "INVALID_RADIUS", message: string) { super(message); }
}

export function haversineMiles(a: Pick<Coordinates, "latitude" | "longitude">, b: Pick<Coordinates, "latitude" | "longitude">): number {
  const earthRadiusMiles = 3958.7613;
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function resolveSearchOrigin(input: Pick<ProviderSearchInput, "zipCode" | "location">): Coordinates {
  const zip = input.zipCode?.trim();
  if (zip) {
    if (!/^\d{5}$/.test(zip)) throw new ProviderSearchError("INVALID_ZIP", "Enter a valid 5-digit ZIP code.");
    if (!places[zip]) throw new ProviderSearchError("GEOCODING_FAILED", "That ZIP code is not available in the offline demo geocoder. Try 72701, 72712, 72761, 64801, or 74464.");
    return places[zip];
  }
  const key = input.location?.trim().toLowerCase();
  if (!key) throw new ProviderSearchError("GEOCODING_FAILED", "Enter a ZIP code or city and state.");
  if (!places[key]) throw new ProviderSearchError("GEOCODING_FAILED", "That location is not available in the offline demo geocoder. Try Fayetteville, AR; Bentonville, AR; Joplin, MO; or Tahlequah, OK.");
  return places[key];
}

export function searchProviders(input: ProviderSearchInput): { origin: Coordinates; radiusMiles: number; results: ProviderSearchResult[]; mode: "synthetic-demo" } {
  const origin = resolveSearchOrigin(input);
  const radiusMiles = input.radiusMiles ?? 100;
  if (!Number.isFinite(radiusMiles) || radiusMiles < 1 || radiusMiles > 500) throw new ProviderSearchError("INVALID_RADIUS", "Travel radius must be between 1 and 500 miles.");
  const specialty = input.specialty?.trim().toLowerCase();
  const name = input.name?.trim().toLowerCase();

  const results = demoDirectory.flatMap((entry): ProviderSearchResult[] => {
    if (specialty && specialty !== "all specialties" && entry.specialty.toLowerCase() !== specialty) return [];
    if (name && !`${entry.name} ${entry.facilityName}`.toLowerCase().includes(name)) return [];
    if (input.kind && input.kind !== "All" && entry.kind !== input.kind) return [];
    if (input.format && input.format !== "Either" && !entry.formats.includes(input.format)) return [];
    const telehealthOnly = entry.formats.length === 1 && entry.formats[0] === "Telehealth";
    const distance = telehealthOnly ? null : haversineMiles(origin, entry);
    if (distance !== null && distance > radiusMiles) return [];
    const matchReasons = [
      specialty ? `Matches ${entry.specialty}` : entry.specialty,
      telehealthOnly ? "Telehealth — travel distance not applicable" : `Within ${radiusMiles} miles`,
      input.format && input.format !== "Either" ? `Offers ${input.format.toLowerCase()}` : `Offers ${entry.formats.join(" and ").toLowerCase()}`,
    ];
    return [{ ...entry, distanceMiles: distance === null ? null : Math.round(distance * 10) / 10, matchReasons }];
  });

  results.sort(input.sort === "name"
    ? (a, b) => a.name.localeCompare(b.name)
    : (a, b) => (a.distanceMiles ?? Number.POSITIVE_INFINITY) - (b.distanceMiles ?? Number.POSITIVE_INFINITY));
  return { origin, radiusMiles, results, mode: "synthetic-demo" };
}
