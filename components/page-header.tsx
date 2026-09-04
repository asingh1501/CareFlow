export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="welcome">
      <div>{eyebrow && <div className="eyebrow" style={{ marginBottom: 9 }}>{eyebrow}</div>}<h1 className="page-title">{title}</h1>{description && <p>{description}</p>}</div>
      {actions && <div className="inline-actions">{actions}</div>}
    </div>
  );
}
