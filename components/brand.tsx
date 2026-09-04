import Link from "next/link";
import { HeartPulse } from "lucide-react";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="CareFlow AR home" style={inverse ? { color: "white" } : undefined}>
      <span className="brand-mark"><HeartPulse size={18} strokeWidth={2.2} /></span>
      <span>CareFlow <span style={{ color: "#126b5d" }}>AR</span><small>CARE COORDINATION</small></span>
    </Link>
  );
}
