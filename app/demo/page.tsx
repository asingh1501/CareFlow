import Link from "next/link";
import { ArrowRight, BarChart3, ClipboardCheck, Search, Stethoscope, UsersRound } from "lucide-react";
import { Brand } from "@/components/brand";

const stages = [
  { step: "01", title: "Patient intake", description: "Start Jordan Lee’s conversational care request.", href: "/patient/intake", icon: Search },
  { step: "02", title: "Appointment match", description: "Show transparent, preference-aware ranking.", href: "/patient/appointments", icon: ClipboardCheck },
  { step: "03", title: "Staff operations", description: "See preparation, tasks, and waitlist recovery.", href: "/staff", icon: UsersRound },
  { step: "04", title: "Provider brief", description: "Review concise patient-reported information.", href: "/provider/patient/jordan", icon: Stethoscope },
  { step: "05", title: "Simulated impact", description: "Close with operational analytics.", href: "/analytics", icon: BarChart3 },
];

export default function DemoPage() {
  return <main style={{ minHeight: "100vh", background: "#f6f8f7", padding: "28px 0 80px" }}><div className="container"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}><Brand /><Link href="/" className="btn btn-secondary">Back to overview</Link></div><div style={{ maxWidth: 720, margin: "70px 0 38px" }}><div className="eyebrow">Presentation mode</div><h1 className="page-title" style={{ marginTop: 12 }}>One story. Three roles. A clearer start to care.</h1><p className="muted" style={{ fontSize: 17, lineHeight: 1.7 }}>Follow Jordan’s journey or jump directly to any stage. The dark demo navigation remains available inside every workspace.</p></div><div className="grid-3">{stages.map(({ step, title, description, href, icon: Icon }) => <Link key={step} href={href} className="card card-pad" style={{ minHeight: 220, display: "flex", flexDirection: "column" }}><div style={{ display: "flex", justifyContent: "space-between" }}><div className="info-icon"><Icon size={17} /></div><span className="eyebrow">{step}</span></div><h2 className="section-title" style={{ marginTop: 28 }}>{title}</h2><p className="small muted" style={{ lineHeight: 1.6 }}>{description}</p><span style={{ color: "var(--green)", marginTop: "auto", display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700 }}>Open stage <ArrowRight size={14} /></span></Link>)}</div><div className="notice notice-warning" style={{ marginTop: 24 }}><strong>Demo boundary:</strong> CareFlow organizes and routes information. It does not diagnose, prescribe, or replace emergency or clinical judgment.</div></div></main>;
}
