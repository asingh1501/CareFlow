"use client";

import { AlertCircle, Check, ClipboardList } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { staffTasks } from "@/lib/demo-data";
import { useDemo } from "@/components/demo-provider";

export default function StaffTasksPage() {
  const { showToast } = useDemo();
  return <AppShell role="staff"><PageHeader eyebrow="Operational queue" title="Tasks" description="Resolve preparation and scheduling exceptions in one place." /><div className="stack">{staffTasks.map((task) => <section className="card card-pad" key={task.id}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><div className="info-icon">{task.priority === "high" ? <AlertCircle size={18} /> : <ClipboardList size={18} />}</div><div style={{ flex: 1 }}><strong>{task.label}</strong><div className="small muted">{task.detail}</div></div><StatusBadge tone={task.priority === "high" ? "amber" : "gray"}>{task.priority === "high" ? "Time-sensitive" : "Open"}</StatusBadge><button className="btn btn-secondary" onClick={() => showToast(`${task.label} marked complete`)}><Check size={15} /> Resolve</button></div></section>)}</div><div className="notice notice-warning" style={{ marginTop: 20 }}><AlertCircle size={17} /><span><strong>Supportive no-show workflow:</strong> “May need confirmation” signals can trigger reminders, easier rescheduling, or transportation-resource prompts. They never deny, deprioritize, or remove an appointment.</span></div></AppShell>;
}
