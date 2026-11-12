"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Info, MapPin, Search, SlidersHorizontal, Video } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { useDemo } from "@/components/demo-provider";
import { specialties } from "@/lib/providers/directory";
import type { ProviderSearchResult } from "@/lib/providers/search";

interface SearchResponse { origin: { label: string }; radiusMiles: number; results: ProviderSearchResult[]; mode: "synthetic-demo" }

export default function ProviderSearchPage() {
  const { demoState, updateDemoState, showToast } = useDemo();
  const prefs = demoState.preferences;
  const [zip, setZip] = useState(prefs.zipCode);
  const [location, setLocation] = useState(prefs.location);
  const [specialty, setSpecialty] = useState(prefs.specialty || "All specialties");
  const [radius, setRadius] = useState(prefs.radiusMiles);
  const [format, setFormat] = useState(prefs.format);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"All" | "Physician" | "Clinic" | "Hospital">("All");
  const [sort, setSort] = useState<"distance" | "name">("distance");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<ProviderSearchResult | null>(null);

  const runSearch = useCallback(async () => {
    setLoading(true); setError("");
    const query = new URLSearchParams({ radius: String(radius), specialty, format, sort, kind });
    if (zip.trim()) query.set("zip", zip.trim()); else query.set("location", location.trim());
    if (name.trim()) query.set("name", name.trim());
    try {
      const response = await fetch(`/api/providers/search?${query}`);
      const payload = await response.json() as SearchResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error || "Search failed.");
      setData(payload);
    } catch (reason) { setData(null); setError(reason instanceof Error ? reason.message : "Search failed."); }
    finally { setLoading(false); }
  }, [format, kind, location, name, radius, sort, specialty, zip]);

  useEffect(() => { const timer = window.setTimeout(() => void runSearch(), 0); return () => window.clearTimeout(timer); }, [runSearch]);
  function submit(event: FormEvent) { event.preventDefault(); updateDemoState({ preferences: { ...prefs, zipCode: zip, location, specialty, radiusMiles: radius, format } }); void runSearch(); }
  function favorite(id: string) {
    const favorites = demoState.favorites.includes(id) ? demoState.favorites.filter((item) => item !== id) : [...demoState.favorites, id];
    updateDemoState({ favorites }); showToast(favorites.includes(id) ? "Provider saved to favorites" : "Provider removed from favorites");
  }

  return <AppShell role="patient"><PageHeader eyebrow="Cross-state care discovery" title="Find providers and facilities" description="Search by actual geodesic distance—not state borders. Default travel radius is 100 miles." />
    <div className="notice notice-warning" style={{ marginBottom: 18 }}><Info size={18} /><span><strong>Synthetic directory mode.</strong> These entries test search behavior only. They are not verified live providers, affiliations, insurance matches, accepting-patient status, or appointment availability.</span></div>
    <form className="card card-pad provider-search-form" onSubmit={submit}>
      <div className="form-grid">
        <div className="field"><label htmlFor="provider-zip">ZIP code</label><input id="provider-zip" inputMode="numeric" maxLength={5} value={zip} onChange={(event) => setZip(event.target.value)} placeholder="72701" /></div>
        <div className="field"><label htmlFor="provider-location">City and state (used when ZIP is blank)</label><input id="provider-location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Fayetteville, AR" /></div>
        <div className="field"><label htmlFor="provider-specialty">Specialty</label><select id="provider-specialty" value={specialty} onChange={(event) => setSpecialty(event.target.value)}><option>All specialties</option>{specialties.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="field"><label htmlFor="provider-name">Provider or facility name</label><input id="provider-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Optional" /></div>
        <div className="field"><label htmlFor="provider-kind">Result type</label><select id="provider-kind" value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}><option value="All">Doctors, clinics, and hospitals</option><option>Physician</option><option>Clinic</option><option>Hospital</option></select></div>
        <div className="field"><label htmlFor="provider-radius">Travel radius</label><select id="provider-radius" value={radius} onChange={(event) => setRadius(Number(event.target.value))}>{[25, 50, 75, 100, 150, 200].map((miles) => <option key={miles} value={miles}>{miles} miles</option>)}</select></div>
        <div className="field"><label htmlFor="provider-format">Visit format</label><select id="provider-format" value={format} onChange={(event) => setFormat(event.target.value as typeof format)}><option>Either</option><option>In person</option><option>Telehealth</option></select></div>
      </div>
      <div className="inline-actions" style={{ marginTop: 16 }}><button className="btn btn-primary" disabled={loading}><Search size={16} />{loading ? "Searching…" : "Search"}</button><label className="field compact-field">Sort <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="distance">Distance</option><option value="name">Name</option></select></label></div>
    </form>
    {error && <div className="notice notice-danger" role="alert" style={{ marginTop: 18 }}>{error}</div>}
    {loading && <div className="stack" style={{ marginTop: 18 }} aria-label="Loading providers">{[1,2,3].map((item) => <div className="card card-pad skeleton provider-skeleton" key={item} />)}</div>}
    {!loading && data && <section style={{ marginTop: 22 }}><div className="section-head"><div><h2 className="section-title">{data.results.length} demo result{data.results.length === 1 ? "" : "s"}</h2><p className="small muted">From {data.origin.label} · within {data.radiusMiles} miles · results may cross state borders</p></div><SlidersHorizontal size={18} className="muted" /></div>
      {data.results.length === 0 ? <div className="card empty"><Search size={26} /><strong>No matching demo entries</strong><p>Try a larger radius, another specialty, or “Either” visit format.</p></div> : <div className="stack">{data.results.map((provider) => <article className="card provider-result" key={provider.id}>
        <div className="provider-result-main"><div><div className="inline-actions"><span className="badge badge-blue">Synthetic demo</span><span className="badge badge-gray">{provider.kind}</span></div><h3>{provider.name}</h3><p>{provider.specialty} · {provider.facilityName}</p><p className="small muted"><MapPin size={13} /> {provider.city}, {provider.state} · {provider.distanceMiles === null ? "Telehealth — distance not applicable" : `${provider.distanceMiles} miles`}</p></div><button className={`icon-button ${demoState.favorites.includes(provider.id) ? "favorite-active" : ""}`} onClick={() => favorite(provider.id)} aria-label={demoState.favorites.includes(provider.id) ? "Remove from favorites" : "Save to favorites"}><Heart size={18} fill={demoState.favorites.includes(provider.id) ? "currentColor" : "none"} /></button></div>
        <div className="recommendation-reasons">{provider.matchReasons.map((reason) => <span className="reason" key={reason}>{provider.formats.includes("Telehealth") && reason.includes("Telehealth") ? <Video size={13} /> : <MapPin size={13} />}{reason}</span>)}</div>
        <div className="inline-actions" style={{ marginTop: 16 }}><button className="btn btn-secondary" onClick={() => setSelected(selected?.id === provider.id ? null : provider)}>{selected?.id === provider.id ? "Close details" : "Provider details"}</button><Link className="btn btn-primary" href="/patient/appointments">View demo appointment options</Link></div>
        {selected?.id === provider.id && <div className="provider-details"><strong>Directory details</strong><p className="small muted">Physical street address and verified contact information are unavailable in demo mode. Scheduling method: {provider.schedulingMethod}. Accessibility recorded in this synthetic entry: {provider.accessibility.join(", ")}.</p></div>}
      </article>)}</div>}
    </section>}
  </AppShell>;
}
