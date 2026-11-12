"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { if (process.env.NODE_ENV === "development") console.error(error); }, [error]);
  return <main className="error-page"><section className="card card-pad error-card" role="alert"><div className="eyebrow">CareFlow could not load this view</div><h1 className="page-title">Something went wrong.</h1><p className="muted">Your last action may not have completed. Try this view again, or return to the demo home.</p><div className="inline-actions"><button className="btn btn-primary" onClick={reset}>Try again</button><Link className="btn btn-secondary" href="/demo">Return to demo</Link></div></section></main>;
}
