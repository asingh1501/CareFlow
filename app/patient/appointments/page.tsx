"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Accessibility, ArrowRight, Check, Clock3, Info, MapPin, SlidersHorizontal, Video } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { PreferencesDialog } from "@/components/preferences-dialog";
import { StatusBadge, toneForStatus } from "@/components/status-badge";
import { useDemo } from "@/components/demo-provider";
import { navigateCare } from "@/lib/ai/care-navigation";
import { rankAppointments } from "@/lib/scheduling/match";
import type { CarePreferences, RankedAppointment } from "@/lib/types";

export default function AppointmentsPage() {
  const { careRequest, setCareRequest, demoState, updateDemoState, showToast } = useDemo();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const preferences = demoState.preferences;
  const requestForRanking = useMemo(() => ({ ...careRequest, location: preferences.location || careRequest.location, specialty: preferences.specialty, radiusMiles: preferences.radiusMiles, availability: preferences.timeRange, format: preferences.format === "Either" ? careRequest.format : preferences.format }), [careRequest, preferences]);
  const result = navigateCare(requestForRanking);
  const ranked = useMemo(() => rankAppointments(requestForRanking, result.category).filter((slot) => (slot.format === "Telehealth" || slot.distance <= preferences.radiusMiles) && (preferences.format === "Either" || slot.format === preferences.format)), [preferences, requestForRanking, result.category]);

  function savePreferences(next: CarePreferences) {
    updateDemoState({ preferences: next });
    setCareRequest({ ...careRequest, location: next.location, specialty: next.specialty, radiusMiles: next.radiusMiles, availability: next.timeRange, format: next.format === "Either" ? careRequest.format : next.format });
    setPreferencesOpen(false); showToast("Preferences saved and recommendations refreshed");
  }
  function requestAppointment(slot: RankedAppointment) {
    const id = `request-${slot.id}`;
    if (demoState.appointmentRequests.some((item) => item.id === id && item.status !== "cancelled")) return showToast("You already have an active request for this demo slot");
    const startsAt = slot.day === "Today" ? "2027-01-15T22:20:00.000Z" : "2027-01-16T20:00:00.000Z";
    updateDemoState({ appointmentRequests: [...demoState.appointmentRequests, { id, providerName: slot.provider.name, facilityName: slot.clinic.name, specialty: slot.provider.specialty, startsAt, format: slot.format, status: "requested", source: "demo", notes: `${slot.day} · ${slot.time} (synthetic slot)` }] });
    showToast("Demo appointment request submitted — not externally confirmed");
  }

  return <AppShell role="patient"><PageHeader eyebrow={`${ranked.length} demo options`} title="Appointments matched to you" description="Synthetic options ranked by visit fit, time, distance, format, accessibility, and sample insurance compatibility." actions={<><Link className="btn btn-secondary" href="/patient/providers"><MapPin size={16} /> Search providers</Link><button className="btn btn-secondary" onClick={() => setPreferencesOpen(true)}><SlidersHorizontal size={16} /> Change preferences</button></>} />
    <div className="notice notice-warning" style={{ marginBottom: 18 }}><Info size={17} /><span><strong>Demo scheduling only.</strong> These are synthetic slots. Submitting creates a patient request; it does not confirm a real appointment.</span></div>
    <div className="filterbar preference-summary" style={{ marginBottom: 20 }}><span className="small muted">Current preferences</span><span className="filter active"><MapPin size={14} />Within {preferences.radiusMiles} miles</span><span className="filter active"><Check size={14} />{preferences.specialty}</span><span className="filter active">{preferences.format === "Telehealth" ? <Video size={14} /> : <Accessibility size={14} />}{preferences.format}</span><span className="filter active"><Clock3 size={14} />{preferences.timeRange}</span></div>
    {ranked.length === 0 ? <div className="card empty"><SlidersHorizontal size={26} /><strong>No demo appointments match these preferences</strong><p>Change the radius, time, or visit format, or search the provider directory.</p><button className="btn btn-primary" onClick={() => setPreferencesOpen(true)}>Change preferences</button></div> : <div className="stack">{ranked.map((slot) => { const requested = demoState.appointmentRequests.some((item) => item.id === `request-${slot.id}` && item.status !== "cancelled"); return <article className="card appointment-card" key={slot.id}><div className="appointment-main"><div><StatusBadge tone={toneForStatus(slot.label)}>{slot.label}</StatusBadge><div className="provider-line" style={{ marginTop: 12 }}><div className="provider-avatar">{slot.provider.initials}</div><div><h3>{slot.provider.name}</h3><p>{slot.provider.specialty} · {slot.clinic.name}</p><p>{slot.clinic.city}, {slot.clinic.state} · Synthetic demo</p></div></div></div><div className="appointment-time"><strong>{slot.day} · {slot.time}</strong><span>{slot.format} · {slot.distance ? `${slot.distance} miles` : "Travel not applicable"}</span><div className="small muted" style={{ marginTop: 5 }}><Clock3 size={12} style={{ display: "inline", verticalAlign: -2 }} /> Simulated wait {slot.expectedWait.toLowerCase()}</div></div><button className="btn btn-primary" disabled={requested} onClick={() => requestAppointment(slot)}>{requested ? "Request submitted" : "Request demo slot"}<ArrowRight size={15} /></button></div><div className="recommendation-reasons" aria-label="Reasons for recommendation">{slot.reasons.map((reason) => <span className="reason" key={reason}><Check size={13} color="var(--green)" />{reason}</span>)}<span className="reason"><strong>{slot.score}%</strong> preference match</span></div>{requested && <Link className="btn btn-secondary" style={{ marginTop: 14 }} href={`/patient/appointments/request-${slot.id}`}>View request status</Link>}</article>; })}</div>}
    <div className="notice notice-info" style={{ marginTop: 20 }}><Check size={17} /><span>Rankings organize scheduling convenience only. They do not establish clinical priority, verify network participation, or deny access to care.</span></div>
    {preferencesOpen && <PreferencesDialog value={preferences} onClose={() => setPreferencesOpen(false)} onSave={savePreferences} />}
  </AppShell>;
}
