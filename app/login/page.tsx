import Link from "next/link";
import { ClipboardCheck, HeartPulse, Stethoscope, UserRound } from "lucide-react";
import { Brand } from "@/components/brand";

const roles = [
  { href: "/patient", title: "Continue as Patient", description: "Find care, book, and prepare", icon: UserRound },
  { href: "/staff", title: "Continue as Staff", description: "Coordinate today’s patients", icon: ClipboardCheck },
  { href: "/provider", title: "Continue as Provider", description: "Review patient-reported briefs", icon: Stethoscope },
];

export default function LoginPage() {
  return <main style={{ minHeight: "100vh", background: "#f4f7f5", display: "grid", placeItems: "center", padding: 24 }}><div style={{ width: "min(520px,100%)" }}><div style={{ textAlign: "center", marginBottom: 28 }}><Brand /><h1 className="page-title" style={{ marginTop: 25 }}>Choose a demo view</h1><p className="muted">No account or real patient information is needed.</p></div><div className="card card-pad stack">{roles.map(({ href, title, description, icon: Icon }) => <Link key={href} href={href} className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}><div className="info-icon" style={{ width: 42, height: 42 }}><Icon size={19} /></div><div style={{ flex: 1 }}><strong>{title}</strong><div className="small muted">{description}</div></div><span aria-hidden>→</span></Link>)}<div className="notice notice-info"><HeartPulse size={17} />This prototype uses fictional people, providers, clinics, and insurance plans.</div></div></div></main>;
}
