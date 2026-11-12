import Link from "next/link";

export default function NotFoundPage() {
  return <main className="error-page"><section className="card card-pad error-card"><div className="eyebrow">404</div><h1 className="page-title">This CareFlow page was not found.</h1><p className="muted">The link may be outdated or the requested demo record may not exist.</p><div className="inline-actions"><Link className="btn btn-primary" href="/">Go home</Link><Link className="btn btn-secondary" href="/demo">Open demo</Link></div></section></main>;
}
