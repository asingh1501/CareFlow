import Link from "next/link";
import { ArrowRight, Check, ClipboardCheck, Clock3, HeartHandshake, MapPin, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { Brand } from "@/components/brand";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <nav className="container landing-nav" aria-label="Main navigation">
          <Brand />
          <div className="landing-links">
            <Link href="/responsible-ai">Responsible AI</Link>
            <Link href="/login">Sign in</Link>
            <Link className="btn btn-secondary" href="/demo">Explore demo</Link>
          </div>
        </nav>
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge badge-green"><span className="dot" /> Built for better access across Arkansas</span>
            <h1>Healthcare starts before the appointment.</h1>
            <p>CareFlow helps patients navigate care, find appointments, complete intake, and arrive prepared—while giving care teams a clearer start.</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/patient/intake">Find care <ArrowRight size={16} /></Link>
              <Link className="btn btn-secondary" href="/patient">View my appointments</Link>
            </div>
            <div className="trustline"><span><ShieldCheck size={15} /> Navigation, not diagnosis</span><span><MapPin size={15} /> Fictional demo data</span></div>
          </div>
          <div className="hero-product" aria-label="CareFlow product preview">
            <div className="hero-window">
              <div className="window-head"><strong>Prepare for your visit</strong><span className="badge badge-green">75% ready</span></div>
              <div className="window-body">
                <div className="mini-row"><div><div className="eyebrow">Upcoming appointment</div><h3 style={{ margin: "8px 0 4px" }}>Today at 4:20 PM</h3><span className="small muted">Ozark Grove Family Clinic</span></div><span className="badge badge-green"><Check size={12} /> Confirmed</span></div>
                <div className="mini-appointment">
                  <div className="mini-provider"><div className="avatar">MP</div><div><strong style={{ fontSize: 13 }}>Dr. Maya Patel</strong><div className="small muted">Primary Care · In person</div></div></div>
                  <div className="mini-meta"><span>2.8 miles away</span><span>Insurance match</span><span>After 3 PM</span></div>
                  <div className="mini-progress"><span style={{ width: "75%" }} /></div>
                </div>
                <div className="info-list" style={{ marginTop: 13 }}>
                  <div className="info-row"><div className="info-icon"><Check size={15} /></div><div><strong>Reason for visit</strong><span>Patient-reported information organized</span></div></div>
                  <div className="info-row"><div className="info-icon"><ClipboardCheck size={15} /></div><div><strong>Two items left</strong><span>Medical history and clinic forms</span></div></div>
                </div>
              </div>
            </div>
            <div className="signal-card"><span className="badge badge-green">Care team update</span><strong style={{ marginTop: 9 }}>Patient is nearly ready</strong><span className="small muted">Intake organized before arrival</span></div>
          </div>
        </div>
      </section>

      <section className="value-strip" aria-label="CareFlow value">
        <div className="container value-grid">
          <div className="value-item"><HeartHandshake size={22} /><div><strong>Less confusion</strong><span>A guided, understandable front door to care.</span></div></div>
          <div className="value-item"><Clock3 size={22} /><div><strong>Faster coordination</strong><span>Appointment choices matched to real preferences.</span></div></div>
          <div className="value-item"><UsersRound size={22} /><div><strong>Prepared care teams</strong><span>Organized information arrives before the patient.</span></div></div>
          <div className="value-item"><Sparkles size={22} /><div><strong>Responsible assistance</strong><span>Administrative AI with clinical decisions kept human.</span></div></div>
        </div>
      </section>

      <section className="story-section">
        <div className="container story-grid">
          <div><div className="eyebrow">One connected experience</div><h2 style={{ fontSize: 38, letterSpacing: "-.045em", margin: "13px 0" }}>From “I need care” to ready for the visit.</h2><p className="muted" style={{ lineHeight: 1.7 }}>CareFlow connects the steps that usually happen across phone calls, forms, portals, and front desks.</p><Link className="btn btn-primary" href="/demo" style={{ marginTop: 15 }}>Walk through the demo <ArrowRight size={16} /></Link></div>
          <div className="steps">
            <div className="step"><div className="step-num">1</div><div><h3>Tell CareFlow what you need</h3><p>A conversational intake turns patient language into structured, patient-reported information.</p></div></div>
            <div className="step"><div className="step-num">2</div><div><h3>Understand the next step</h3><p>Conservative routing helps navigate care without diagnosing or making clinical decisions.</p></div></div>
            <div className="step"><div className="step-num">3</div><div><h3>Choose a better-matched appointment</h3><p>Options are ranked by time, distance, format, accessibility, and sample insurance compatibility.</p></div></div>
            <div className="step"><div className="step-num">4</div><div><h3>Arrive prepared</h3><p>Forms, reminders, and a concise pre-visit brief reduce administrative friction for everyone.</p></div></div>
          </div>
        </div>
      </section>

      <footer className="footer"><div className="container footer-inner"><Brand inverse /><p>CareFlow AR is a student healthcare innovation prototype using fictional data. It does not diagnose, prescribe, replace clinicians, or guarantee a care setting. Production use would require formal security, compliance, legal, and clinical review.</p><Link href="/responsible-ai" className="btn btn-secondary">How we use AI</Link></div></footer>
    </>
  );
}
