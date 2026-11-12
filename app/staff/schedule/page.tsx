import { CalendarDays, Clock3 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { PatientTable } from "@/components/patient-table";

export default function StaffSchedulePage() { return <AppShell role="staff"><PageHeader eyebrow="Daily schedule" title="Friday, September 4" description="18 appointments · 4 open slots · Fictional demo schedule" actions={<button className="btn btn-primary" disabled title="Creating live appointments requires a scheduling integration"><CalendarDays size={16} /> Add appointment unavailable</button>} /><div className="notice notice-info" style={{ marginBottom: 18 }}><Clock3 size={17} />Expected-wait labels are simulated operational estimates, not guarantees.</div><section className="card"><PatientTable /></section></AppShell>; }
