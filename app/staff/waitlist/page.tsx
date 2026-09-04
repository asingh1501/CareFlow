"use client";

import { Check, RefreshCcw, Send } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { waitlistEntries } from "@/lib/demo-data";
import { useDemo } from "@/components/demo-provider";

export default function StaffWaitlistPage() {
  const { showToast } = useDemo();
  return <AppShell role="staff"><PageHeader eyebrow="Cancellation optimizer" title="Fill tomorrow’s 2:00 PM opening" description="Primary care · Ozark Grove Family Clinic · Transparent eligibility matching" actions={<button className="btn btn-primary" onClick={() => showToast("Offer sent to the highest-ranked eligible patient")}><Send size={16} /> Send offer</button>} /><div className="notice notice-info" style={{ marginBottom: 18 }}><Check size={17} />Waitlist rank supports scheduling only. It does not determine clinical priority or remove any patient’s existing appointment.</div><section className="card"><div className="card-pad section-head" style={{ margin: 0 }}><div><h2 className="section-title">Eligible patients</h2><p className="small muted">3 strong matches · 4 entries reviewed</p></div><StatusBadge tone="green">Slot recoverable</StatusBadge></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Patient</th><th>Requested</th><th>Preference match</th><th>Travel</th><th>Availability</th><th>Action</th></tr></thead><tbody>{waitlistEntries.map((entry, index) => <tr key={entry.patient}><td><div className="patient-cell"><div className="avatar">{entry.patient.split(" ").map((part) => part[0]).join("")}</div>{entry.patient}</div></td><td>{entry.requested}</td><td><StatusBadge tone={index < 3 ? "green" : "gray"}>{entry.match}</StatusBadge></td><td>{entry.distance}</td><td>{entry.available}</td><td><button className="btn btn-secondary" onClick={() => showToast(`Offer sent to ${entry.patient}`)}>Offer slot</button></td></tr>)}</tbody></table></div></section><section className="card card-pad" style={{ marginTop: 20 }}><div style={{ display: "flex", gap: 15, alignItems: "center" }}><div className="info-icon"><RefreshCcw size={18} /></div><div><strong>Prototype scenario</strong><div className="small muted">A patient cancellation opened this slot. CareFlow scored only scheduling compatibility and availability factors.</div></div></div></section></AppShell>;
}
