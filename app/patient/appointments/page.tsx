"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Accessibility, ArrowRight, Check, Clock3, MapPin, SlidersHorizontal, Video } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, toneForStatus } from "@/components/status-badge";
import { useDemo } from "@/components/demo-provider";
import { navigateCare } from "@/lib/ai/care-navigation";
import { rankAppointments } from "@/lib/scheduling/match";

export default function AppointmentsPage() {
  const router = useRouter();
  const { careRequest, updateDemoState, showToast } = useDemo();
  const [filters, setFilters] = useState<string[]>(["Within 10 miles", "In person"]);
  const result = navigateCare(careRequest);
  const ranked = useMemo(() => rankAppointments(careRequest, result.category), [careRequest, result.category]);
  const toggle = (filter: string) => setFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]);
  const book = (slotId: string) => { updateDemoState({ bookedSlotId: slotId, jordanStatus: "Missing Forms", completedForms: ["reason", "basic", "appointment"] }); showToast("Appointment confirmed for today at 4:20 PM"); router.push("/patient/prepare/demo"); };
  return <AppShell role="patient"><PageHeader eyebrow="5 recommended options" title="Appointments matched to you" description="Ranked by visit fit, schedule, distance, format, accessibility, and sample insurance compatibility." actions={<button className="btn btn-secondary"><SlidersHorizontal size={16} /> Change preferences</button>} />
    <div className="filterbar" style={{ marginBottom: 20 }}><span className="small muted">Filters</span>{[{ label: "Within 10 miles", icon: MapPin }, { label: "In person", icon: Check }, { label: "Telehealth", icon: Video }, { label: "Rural clinic", icon: MapPin }, { label: "Accessible", icon: Accessibility }].map(({ label, icon: Icon }) => <button key={label} onClick={() => toggle(label)} className={`filter ${filters.includes(label) ? "active" : ""}`}><Icon size={14} />{label}</button>)}</div>
    <div className="stack">{ranked.map((slot) => <article className="card appointment-card" key={slot.id}><div className="appointment-main"><div><StatusBadge tone={toneForStatus(slot.label)}>{slot.label}</StatusBadge><div className="provider-line" style={{ marginTop: 12 }}><div className="provider-avatar">{slot.provider.initials}</div><div><h3>{slot.provider.name}</h3><p>{slot.provider.specialty} · {slot.clinic.name}</p><p>{slot.clinic.city}, Arkansas {slot.clinic.rural ? "· Rural access clinic" : ""}</p></div></div></div><div className="appointment-time"><strong>{slot.day} · {slot.time}</strong><span>{slot.format} · {slot.distance ? `${slot.distance} miles` : "From home"}</span><div className="small muted" style={{ marginTop: 5 }}><Clock3 size={12} style={{ display: "inline", verticalAlign: -2 }} /> Expected wait {slot.expectedWait.toLowerCase()}</div></div><button className="btn btn-primary" onClick={() => book(slot.id)}>Book appointment <ArrowRight size={15} /></button></div><div className="recommendation-reasons" aria-label="Reasons for recommendation">{slot.reasons.map((reason) => <span className="reason" key={reason}><Check size={13} color="var(--green)" />{reason}</span>)}<span className="reason"><strong>{slot.score}%</strong> preference match</span></div></article>)}</div>
    <div className="notice notice-info" style={{ marginTop: 20 }}><ShieldAlertText />Appointment rankings organize scheduling factors only. They do not determine clinical priority or deny access to care.</div>
  </AppShell>;
}

function ShieldAlertText() { return <><Check size={17} /><span></span></>; }
