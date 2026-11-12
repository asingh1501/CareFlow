"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { PatientTable } from "@/components/patient-table";

export default function StaffPatientsPage() {
  const [query, setQuery] = useState("");
  return <AppShell role="staff"><PageHeader eyebrow="Patient coordination" title="Patients" description="View intake and preparation status with role-appropriate access." /><section className="card"><div className="card-pad section-head" style={{ margin: 0 }}><div><h2 className="section-title">Upcoming patients</h2><p className="small muted">10 fictional demo profiles</p></div><input aria-label="Search patients" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patients…" style={{ minHeight: 40, border: "1px solid var(--line)", borderRadius: 9, padding: "0 12px" }} /></div><PatientTable query={query} /></section></AppShell>;
}
