export function StatusBadge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "green" | "blue" | "amber" | "red" | "gray" }) {
  return <span className={`badge badge-${tone}`}><span className="dot" />{children}</span>;
}

export function toneForStatus(status: string): "green" | "blue" | "amber" | "red" | "gray" {
  if (["Ready", "Complete", "Confirmed", "Best Match"].includes(status)) return "green";
  if (["Waiting", "In progress", "Telehealth"].includes(status)) return "blue";
  if (["Missing Forms", "Needs Review", "Earliest"].includes(status)) return "amber";
  return "gray";
}
