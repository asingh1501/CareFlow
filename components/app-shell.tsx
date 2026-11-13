"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Bell, CalendarDays, ClipboardCheck, Home, RefreshCcw, Search, ShieldCheck, UserRound } from "lucide-react";
import { Brand } from "./brand";
import type { Role } from "@/lib/types";
import { useDemo } from "./demo-provider";

const nav = {
  patient: [
    { href: "/patient", label: "Home", icon: Home },
    { href: "/patient/intake", label: "Find care", icon: Search },
    { href: "/patient/providers", label: "Providers", icon: Search },
    { href: "/patient/appointments", label: "Appointments", icon: CalendarDays },
    { href: "/patient/forms", label: "Forms", icon: ClipboardCheck },
    { href: "/patient/profile", label: "Profile", icon: UserRound },
  ],
  staff: [
    { href: "/staff", label: "Operations", icon: Home },
    { href: "/staff/schedule", label: "Schedule", icon: CalendarDays },
    { href: "/staff/patients", label: "Patients", icon: UserRound },
    { href: "/staff/waitlist", label: "Waitlist", icon: RefreshCcw },
    { href: "/staff/tasks", label: "Tasks", icon: ClipboardCheck },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ],
  provider: [
    { href: "/provider", label: "Today", icon: CalendarDays },
    { href: "/provider/patient/jordan", label: "Pre-visit brief", icon: ClipboardCheck },
    { href: "/responsible-ai", label: "Responsible AI", icon: ShieldCheck },
  ],
} satisfies Record<Role, { href: string; label: string; icon: typeof Home }[]>;

const roleNames = { patient: "Patient portal", staff: "Clinic operations", provider: "Provider workspace" };

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const pathname = usePathname();
  const { resetDemo } = useDemo();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const links = nav[role];
  return (
    <div className="app-page">
      <DemoBar />
      <header className="topbar">
        <div className="container topbar-inner">
          <Brand />
          <nav className="desktop-nav" aria-label={`${roleNames[role]} navigation`}>
            {links.map((item) => <Link key={item.href} href={item.href} className={`nav-link ${pathname === item.href ? "active" : ""}`}>{item.label}</Link>)}
          </nav>
          <div className="topbar-actions">
            <button className="btn btn-secondary" onClick={() => resetDemo()}><RefreshCcw size={14} /> Reset demo</button>
            <div className="notification-wrap"><button className="icon-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((value) => !value)}><Bell size={18} /></button>{notificationsOpen && <div className="notification-popover" role="status"><strong>Demo notifications</strong><span>Appointment preparation is incomplete.</span><span>Your saved preferences are ready to use.</span></div>}</div>
            <Link href={role === "patient" ? "/patient/profile" : role === "staff" ? "/staff" : "/provider"} className="avatar" aria-label={role === "patient" ? "Open Jordan Lee profile" : role === "staff" ? "Alex Morgan workspace" : "Dr. Maya Patel workspace"}>{role === "patient" ? "JL" : role === "staff" ? "AM" : "MP"}</Link>
          </div>
        </div>
      </header>
      <main className="page-main"><div className="container">{children}</div></main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {links.slice(0, 4).map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={`mobile-link ${pathname === item.href ? "active" : ""}`}><Icon size={19} /><span>{item.label}</span></Link>; })}
      </nav>
    </div>
  );
}

export function DemoBar() {
  return (
    <div className="demo-bar">
      <div className="container demo-inner">
        <strong>LIVE DEMO</strong>
        <div className="demo-steps" aria-label="Presentation flow">
          <Link className="demo-step" href="/patient/intake">1 Intake</Link>
          <Link className="demo-step" href="/patient/care-result">2 Care path</Link>
          <Link className="demo-step" href="/patient/appointments">3 Match</Link>
          <Link className="demo-step" href="/patient/prepare/demo">4 Prepare</Link>
          <Link className="demo-step" href="/staff">5 Staff</Link>
          <Link className="demo-step" href="/provider/patient/jordan">6 Provider</Link>
          <Link className="demo-step" href="/analytics">7 Impact</Link>
        </div>
        <div className="demo-role"><Link href="/patient">Patient</Link><Link href="/staff">Staff</Link><Link href="/provider">Provider</Link></div>
      </div>
    </div>
  );
}
