"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquare, ShieldAlert, SlidersHorizontal, Video } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useDemo } from "@/components/demo-provider";
import { navigateCare } from "@/lib/ai/care-navigation";

export default function CareResultPage() {
  const { careRequest } = useDemo();
  const result = navigateCare(careRequest);
  return <AppShell role="patient"><PageHeader eyebrow="Care navigation" title="Recommended next step" description="This recommendation helps with navigation. It is not a medical diagnosis or a guarantee that a care setting is appropriate." />
    {result.urgent ? <section className="card result-hero"><div className="result-icon" style={{ color: "var(--red)", background: "var(--red-soft)" }}><ShieldAlert size={26} /></div><h2>{result.title}</h2><p>{result.explanation}</p><div className="notice notice-danger"><strong>If this may be an emergency:</strong>&nbsp; Call 911 or go to the nearest emergency department. CareFlow will not continue automated scheduling for this request.</div><div className="inline-actions" style={{ marginTop: 20 }}><button className="btn btn-secondary">Speak with clinic staff</button><Link className="btn btn-secondary" href="/patient/intake">Change what I entered</Link></div></section> : <div className="grid-2"><section className="card result-hero"><div className="result-icon"><CheckCircle2 size={27} /></div><h2>{result.title}</h2><p>{result.explanation}</p><div className="notice notice-info" style={{ marginTop: 20 }}><ShieldAlert size={17} /><span>CareFlow does not diagnose conditions, prescribe treatment, or replace a healthcare professional.</span></div><div className="inline-actions" style={{ marginTop: 24 }}><Link className="btn btn-primary" href="/patient/appointments">Find appointments <ArrowRight size={16} /></Link><button className="btn btn-secondary"><Video size={16} /> View telehealth</button></div></section><aside className="stack"><section className="card card-pad"><div className="eyebrow">Why this path</div><div className="info-list" style={{ marginTop: 12 }}><div className="info-row"><div className="info-icon"><CheckCircle2 size={15} /></div><div><strong>Matches the stated need</strong><span>{careRequest.concern}, reported for {careRequest.duration}</span></div></div><div className="info-row"><div className="info-icon"><SlidersHorizontal size={15} /></div><div><strong>Uses your preferences</strong><span>{careRequest.format} · {careRequest.availability}</span></div></div></div></section><section className="card card-pad"><h2 className="section-title">Want another option?</h2><p className="small muted" style={{ lineHeight: 1.6 }}>You can change preferences or ask clinic staff to review your request.</p><div className="inline-actions"><Link className="btn btn-secondary" href="/patient/intake">Change preferences</Link><button className="btn btn-secondary"><MessageSquare size={15} /> Speak with staff</button></div></section></aside></div>}
  </AppShell>;
}
