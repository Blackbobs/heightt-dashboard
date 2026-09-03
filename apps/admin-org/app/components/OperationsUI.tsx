import type { ReactNode } from "react";

export function PageHeader({ title, description, eyebrow, actions }: { title: string; description: ReactNode; eyebrow?: string; actions?: ReactNode }) {
  return <header className="operations-page-header">
    <div>{eyebrow && <p className="operations-eyebrow">{eyebrow}</p>}<h1>{title}</h1><p className="operations-description">{description}</p></div>
    {actions && <div className="operations-header-actions">{actions}</div>}
  </header>;
}

export function PageLoader({ label }: { label: string }) {
  return <div className="operations-loader" role="status"><span className="operations-spinner" /><span>{label}</span></div>;
}
