"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import type { CarePreferences } from "@/lib/types";
import { specialties } from "@/lib/providers/directory";

const defaults: CarePreferences = { location: "Bentonville, AR", zipCode: "72712", specialty: "Primary Care", radiusMiles: 100, format: "Either", preferredDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], timeRange: "Flexible", accessibility: [] };
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function PreferencesDialog({ value, onClose, onSave }: { value: CarePreferences; onClose: () => void; onSave: (value: CarePreferences) => void }) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState("");
  const locationRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    locationRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (draft.zipCode && !/^\d{5}$/.test(draft.zipCode)) return setError("ZIP code must contain exactly 5 digits.");
    if (!draft.zipCode && !draft.location.trim()) return setError("Enter a ZIP code or city and state.");
    if (!Number.isFinite(draft.radiusMiles) || draft.radiusMiles < 1 || draft.radiusMiles > 500) return setError("Travel radius must be between 1 and 500 miles.");
    if (draft.preferredDays.length === 0) return setError("Choose at least one preferred day.");
    onSave(draft);
  }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="preferences-title">
    <div className="modal-head"><div><div className="eyebrow">Appointment matching</div><h2 id="preferences-title">Change preferences</h2></div><button className="icon-button" onClick={onClose} aria-label="Close preferences"><X size={18} /></button></div>
    <form onSubmit={submit}><div className="form-grid">
      <div className="field"><label htmlFor="pref-location">City and state</label><input ref={locationRef} id="pref-location" value={draft.location} onChange={(event) => { setError(""); setDraft({ ...draft, location: event.target.value }); }} /></div>
      <div className="field"><label htmlFor="pref-zip">ZIP code</label><input id="pref-zip" inputMode="numeric" maxLength={5} value={draft.zipCode} onChange={(event) => setDraft({ ...draft, zipCode: event.target.value })} /></div>
      <div className="field"><label htmlFor="pref-specialty">Specialty</label><input id="pref-specialty" list="specialty-list" value={draft.specialty} onChange={(event) => setDraft({ ...draft, specialty: event.target.value })} /><datalist id="specialty-list"><option value="Primary Care" />{specialties.map((item) => <option value={item} key={item} />)}</datalist></div>
      <div className="field"><label htmlFor="pref-radius">Maximum travel distance</label><input id="pref-radius" type="number" min={1} max={500} list="radius-list" value={draft.radiusMiles} onChange={(event) => setDraft({ ...draft, radiusMiles: Number(event.target.value) })} /><datalist id="radius-list">{[25,50,75,100,150,200].map((item) => <option key={item} value={item} />)}</datalist></div>
      <div className="field"><label htmlFor="pref-time">Preferred time</label><select id="pref-time" value={draft.timeRange} onChange={(event) => setDraft({ ...draft, timeRange: event.target.value })}><option>Flexible</option><option>Morning</option><option>Afternoon</option><option>After 3:00 PM</option><option>Evening</option></select></div>
      <div className="field"><label htmlFor="pref-format">Visit format</label><select id="pref-format" value={draft.format} onChange={(event) => setDraft({ ...draft, format: event.target.value as CarePreferences["format"] })}><option>Either</option><option>In person</option><option>Telehealth</option></select></div>
      <fieldset className="field span-2 day-field"><legend>Preferred days</legend><div className="day-options">{days.map((day) => <label key={day}><input type="checkbox" checked={draft.preferredDays.includes(day)} onChange={() => setDraft({ ...draft, preferredDays: draft.preferredDays.includes(day) ? draft.preferredDays.filter((item) => item !== day) : [...draft.preferredDays, day] })} />{day.slice(0,3)}</label>)}</div></fieldset>
    </div>{error && <div className="notice notice-danger" role="alert" style={{ marginTop: 15 }}>{error}</div>}<div className="modal-actions"><button type="button" className="btn btn-quiet" onClick={() => setDraft(defaults)}><RotateCcw size={15} /> Reset to defaults</button><span className="modal-spacer" /><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary">Save preferences</button></div></form>
  </section></div>;
}
