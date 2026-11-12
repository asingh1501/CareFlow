"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, Clock3, Info, MapPin, Stethoscope, XCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useDemo } from "@/components/demo-provider";

export default function AppointmentDetailPage() {
  const params = useParams<{ id: string }>(); const { demoState, updateDemoState, showToast } = useDemo();
  const request = demoState.appointmentRequests.find((item) => item.id === params.id);
  if (request) {
    const cancel = () => { if (!window.confirm("Cancel this demo appointment request?")) return; updateDemoState({ appointmentRequests: demoState.appointmentRequests.map((item) => item.id === request.id ? { ...item, status: "cancelled" as const } : item) }); showToast("Demo appointment request cancelled"); };
    return <AppShell role="patient"><PageHeader title="Appointment request" description="Track the status of this synthetic scheduling request." actions={<Link className="btn btn-secondary" href="/patient/appointments">Back to appointments</Link>} /><div className="notice notice-warning" style={{ marginBottom: 18 }}><Info size={17} /><span>This is a demo patient request, not a confirmed appointment with an external provider.</span></div><div className="grid-2"><section className="card card-pad"><StatusBadge tone={request.status === "cancelled" ? "gray" : "amber"}>{request.status === "requested" ? "Request submitted" : "Cancelled"}</StatusBadge><h2 style={{ fontSize: 27, margin: "15px 0 6px" }}>{request.specialty}</h2><p className="muted">{request.providerName} · {request.facilityName}</p><div className="info-list" style={{ marginTop: 20 }}><InfoRow icon={CalendarDays} title={new Date(request.startsAt).toLocaleDateString()} detail={request.notes || "Synthetic time"} /><InfoRow icon={Stethoscope} title={request.format} detail="Demo scheduling workflow" /><InfoRow icon={Clock3} title="External confirmation" detail="Not connected — no live slot has been reserved" /></div>{request.status !== "cancelled" && <button className="btn btn-danger" style={{ marginTop: 18 }} onClick={cancel}><XCircle size={16} /> Cancel request</button>}</section><aside className="card card-pad"><h2 className="section-title">What happens next</h2><p className="small muted" style={{ lineHeight: 1.65 }}>In production, an authenticated scheduling integration or clinic staff would accept or decline the request. CareFlow does not promote it to “confirmed” without that external confirmation.</p></aside></div></AppShell>;
  }
  return <AppShell role="patient"><PageHeader title="Demo appointment details" description="A synthetic confirmed appointment used for the original presentation flow." actions={<Link className="btn btn-primary" href="/patient/prepare/demo">Continue preparation</Link>} /><div className="grid-2"><section className="card card-pad"><StatusBadge tone="green">Confirmed demo</StatusBadge><h2 style={{ fontSize: 27, margin: "15px 0 6px" }}>Primary care visit</h2><p className="muted">Dr. Maya Patel · Ozark Grove Family Clinic (fictional)</p><div className="info-list" style={{ marginTop: 20 }}><InfoRow icon={CalendarDays} title="Synthetic appointment" detail="4:20 PM" /><InfoRow icon={MapPin} title="Bentonville, AR" detail="Fictional clinic — no directions available" /><InfoRow icon={Stethoscope} title="In-person visit" detail="Primary care demo" /><InfoRow icon={Clock3} title="Expected wait" detail="Simulated estimate only" /></div></section><aside className="notice notice-info"><Info size={17} />No live provider, facility, or calendar is connected to this demo appointment.</aside></div></AppShell>;
}

function InfoRow({ icon: Icon, title, detail }: { icon: typeof CalendarDays; title: string; detail: string }) { return <div className="info-row"><div className="info-icon"><Icon size={16} /></div><div><strong>{title}</strong><span>{detail}</span></div></div>; }
