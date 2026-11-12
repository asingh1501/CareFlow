"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useDemo } from "@/components/demo-provider";

export default function FormsPage() {
  const router = useRouter();
  const { updateDemoState, showToast } = useDemo();
  function submit(event: FormEvent) {
    event.preventDefault();
    updateDemoState({ preparationComplete: true, completedForms: ["reason", "basic", "appointment", "history", "medications", "insurance", "consent"], jordanStatus: "Ready" });
    showToast("Synthetic demo forms saved");
    router.push("/patient/prepare/demo");
  }
  return <AppShell role="patient"><PageHeader eyebrow="Fictional demo form" title="Pre-visit information" description="Review and submit sample details. Do not enter real patient information in this prototype." /><form className="card card-pad" onSubmit={submit}><div className="section-head"><div><h2 className="section-title">Patient information</h2><p className="small muted">Fields marked optional can be skipped.</p></div><span className="badge badge-green">Demo only</span></div><div className="form-grid"><Field label="Full name" value="Jordan Lee" required /><Field label="Date of birth" value="01 / 14 / 1997" required /><Field label="Emergency contact" value="Taylor Lee · (555) 014-2210" /><Field label="Language preference" value="English" /><Field label="Allergies" value="None reported" /><Field label="Current medications" value="Sample medication A" /><Field label="Existing conditions" value="Seasonal allergies (patient-reported)" span /><Field label="Insurance plan (optional)" value="Arkansas Blue (demo)" /><Field label="Member ID" value="DEMO-4821" /><div className="field span-2"><label htmlFor="access">Accessibility or transportation needs</label><textarea id="access" defaultValue="No accessibility needs reported. I have transportation to the clinic." /></div><div className="field span-2"><label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontWeight: 500 }}><input type="checkbox" defaultChecked required style={{ width: 18, minHeight: 18, marginTop: 1 }} /><span>I acknowledge this is a prototype using fictional data and that CareFlow does not provide medical advice or replace a healthcare professional.</span></label></div></div><div className="notice notice-info" style={{ margin: "20px 0" }}><ShieldCheck size={18} />Production deployment would require formal security, privacy, compliance, legal, and clinical review.</div><div className="inline-actions" style={{ justifyContent: "flex-end" }}><button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel and go back</button><button type="submit" className="btn btn-primary">Save and complete <Check size={16} /></button></div></form></AppShell>;
}

function Field({ label, value, span, required = false }: { label: string; value: string; span?: boolean; required?: boolean }) { const id = label.toLowerCase().replace(/\W+/g, "-"); return <div className={`field ${span ? "span-2" : ""}`}><label htmlFor={id}>{label}</label><input id={id} defaultValue={value} required={required} /></div>; }
