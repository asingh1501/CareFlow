"use client";

import { useRouter } from "next/navigation";
import { patients } from "@/lib/demo-data";
import { useDemo } from "./demo-provider";
import { StatusBadge, toneForStatus } from "./status-badge";

export function PatientTable({ providerView = false, query = "" }: { providerView?: boolean; query?: string }) {
  const router = useRouter();
  const { demoState } = useDemo();
  const normalizedQuery = query.trim().toLowerCase();
  const rows = patients
    .map((patient) => patient.id === "jordan" ? { ...patient, status: demoState.jordanStatus, forms: demoState.preparationComplete ? "7 of 7" : patient.forms } : patient)
    .filter((patient) => !normalizedQuery || `${patient.name} ${patient.provider} ${patient.reason} ${patient.status}`.toLowerCase().includes(normalizedQuery));
  return <div className="table-wrap"><table className="data-table"><thead><tr><th>Patient</th><th>Time</th>{!providerView && <th>Provider</th>}<th>Visit reason</th><th>Intake</th><th>Forms</th><th>Status</th></tr></thead><tbody>{rows.map((patient) => <tr key={patient.id} tabIndex={0} aria-label={`Open ${patient.name}`} onClick={() => router.push(providerView ? `/provider/patient/${patient.id}` : `/staff/patients/${patient.id}`)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); router.push(providerView ? `/provider/patient/${patient.id}` : `/staff/patients/${patient.id}`); } }}><td><div className="patient-cell"><div className="avatar">{patient.initials}</div>{patient.name}</div></td><td>{patient.time}</td>{!providerView && <td>{patient.provider}</td>}<td>{patient.reason}</td><td><StatusBadge tone={toneForStatus(patient.intake)}>{patient.intake}</StatusBadge></td><td>{patient.forms}</td><td><StatusBadge tone={toneForStatus(patient.status)}>{patient.status}</StatusBadge></td></tr>)}</tbody></table>{rows.length === 0 && <div className="empty"><strong>No matching demo patients</strong><p>Try a patient name, provider, visit reason, or status.</p></div>}</div>;
}
