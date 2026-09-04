import type { LucideIcon } from "lucide-react";

export function MetricCard({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return <div className="card metric-card"><div className="metric-icon"><Icon size={17} /></div><strong>{value}</strong><span>{label}</span></div>;
}
