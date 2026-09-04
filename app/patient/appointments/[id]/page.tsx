"use client";

import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Stethoscope } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

export default function AppointmentDetailPage() {
  return <AppShell role="patient"><PageHeader title="Appointment details" description="Everything you need for your upcoming visit." actions={<Link className="btn btn-primary" href="/patient/prepare/demo">Continue preparation</Link>} /><div className="grid-2"><section className="card card-pad"><StatusBadge tone="green">Confirmed</StatusBadge><h2 style={{ fontSize: 27, margin: "15px 0 6px" }}>Primary care visit</h2><p className="muted">Dr. Maya Patel · Ozark Grove Family Clinic</p><div className="info-list" style={{ marginTop: 20 }}><Info icon={CalendarDays} title="Today, September 4" detail="4:20 PM" /><Info icon={MapPin} title="410 Sample Way, Bentonville, AR" detail="2.8 miles · Fictional clinic" /><Info icon={Stethoscope} title="In-person visit" detail="Primary care · New and existing patients" /><Info icon={Clock3} title="Expected wait" detail="About 8 minutes · Simulated estimate" /></div></section><aside className="stack"><section className="card card-pad"><h2 className="section-title">Before you go</h2><p className="small muted">Complete the remaining forms and bring a photo ID plus insurance card if available.</p><Link className="btn btn-primary btn-block" href="/patient/prepare/demo">Prepare for your visit</Link></section><section className="notice notice-info"><MapPin size={17} />Need transportation help? Ask the clinic about available community resources.</section></aside></div></AppShell>;
}

function Info({ icon: Icon, title, detail }: { icon: typeof CalendarDays; title: string; detail: string }) { return <div className="info-row"><div className="info-icon"><Icon size={16} /></div><div><strong>{title}</strong><span>{detail}</span></div></div>; }
