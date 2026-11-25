import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Info,
  ShieldCheck,
  Sparkles,
  Circle,
  FileCheck2,
} from "lucide-react";
import type { ReactNode } from "react";
import { type Tone, caseStages, type CaseRecord } from "@/data/mockData";
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Mi Fotomulta Clara home">
      <span className="brand-symbol">
        <ShieldCheck size={38} strokeWidth={1.6} />
      </span>
      <span>
        <span className="brand-name">Mi Fotomulta Clara</span>
        <span className="brand-caption block">Secretaría Distrital de Movilidad</span>
      </span>
    </Link>
  );
}
export function SiteHeader() {
  return (
    <>
      <div className="prototype-banner">
        <Info size={15} />
        <span>
          Academic prototype – not an official service of the Alcaldía de Bogotá. AI responses are
          simulated.
        </span>
      </div>
      <header className="site-header">
        <Brand />
        <div className="header-meta">
          <span className="header-location">Bogotá, Colombia</span>
          <span className="prototype-label">Academic prototype</span>
        </div>
      </header>
    </>
  );
}
export function HelpFooter() {
  return (
    <footer className="help-footer">
      <CircleHelp size={18} />
      <p>Need help? Visit a Centro de Servicios de Movilidad or call Línea 195.</p>
    </footer>
  );
}
export function CitizenLayout({ children, back = true }: { children: ReactNode; back?: boolean }) {
  return (
    <main className="citizen-shell">
      {back && (
        <div className="page-top">
          <Link to="/citizen" className="back-link">
            <ArrowLeft size={17} />
            My fines
          </Link>
          <span className="text-xs text-muted-foreground">JKM482</span>
        </div>
      )}
      {children}
      <HelpFooter />
    </main>
  );
}
const statusIcons = {
  neutral: Circle,
  success: CheckCircle2,
  warning: Clock3,
  danger: Info,
  info: FileCheck2,
};
export function StatusBadge({ text, tone = "neutral" }: { text: string; tone?: Tone }) {
  const Icon = statusIcons[tone];
  return (
    <span className={`status-badge status-${tone}`}>
      <Icon size={13} />
      {text}
    </span>
  );
}
export function SourceTag({ source }: { source: string }) {
  return <span className="source-tag">From {source}</span>;
}
export function DataRow({
  label,
  value,
  source,
}: {
  label: string;
  value: ReactNode;
  source: string;
}) {
  return (
    <div className="data-row">
      <div className="data-label">
        <span>{label}</span>
        <SourceTag source={source} />
      </div>
      <div className="data-value">{value}</div>
    </div>
  );
}
export function AIPanel({
  children,
  title,
  staff = false,
}: {
  children: ReactNode;
  title: string;
  staff?: boolean;
}) {
  return (
    <section className="ai-panel">
      <div className="ai-label">
        <Sparkles size={15} />
        <span>
          {staff
            ? "AI suggestion – an inspector decides"
            : "AI assistant – information, not legal advice"}
        </span>
      </div>
      <h3>{title}</h3>
      {children}
      <span className="simulated-tag">
        <Circle size={7} />
        Simulated response
      </span>
    </section>
  );
}
export function CameraPlaceholder() {
  return (
    <div className="camera-placeholder">
      <Camera size={30} strokeWidth={1.4} />
      <span>Camera photo</span>
      <span className="text-xs">Image unavailable in this prototype</span>
    </div>
  );
}
export function StageTracker({ record }: { record: CaseRecord }) {
  return (
    <>
      <div className="stage-bar" aria-label={`Case stage: ${caseStages[record.stage]}`}>
        {caseStages.map((s, i) => (
          <div
            key={s}
            className={`stage-segment ${i === record.stage ? "current" : i < record.stage ? "done" : ""}`}
            aria-current={i === record.stage ? "step" : undefined}
          >
            {s}
          </div>
        ))}
      </div>
      <section className="panel">
        <StatusBadge text={caseStages[record.stage] ?? "Being checked"} tone="info" />
        <h2 className="mt-4 text-xl font-semibold">{record.statusMessage}</h2>
        <div className="mt-5 text-sm text-muted-foreground">Who has your case now</div>
        <div className="font-medium">{record.holder}</div>
        <div className="mt-4 text-sm text-muted-foreground">Expected by</div>
        <div className="flex items-center gap-2 font-medium">
          <Clock3 size={16} />
          {record.expected}
        </div>
      </section>
      <h2 className="mt-7 text-lg font-semibold">Case history</h2>
      <div className="timeline">
        {record.history.map((h, i) => (
          <div className="timeline-entry" key={`${h.title}-${i}`}>
            <div className="font-medium">{h.title}</div>
            <time>{h.date}</time>
            <p>{h.detail}</p>
          </div>
        ))}
      </div>
    </>
  );
}
export function Unavailable({ label }: { label: string }) {
  return (
    <CitizenLayout>
      <h1 className="page-title">{label} not found</h1>
      <p className="page-subtitle">This record is not part of the fictional demo.</p>
    </CitizenLayout>
  );
}
export const pageHead = (title: string, description: string) => ({
  meta: [
    { title: `${title} | Mi Fotomulta Clara` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} | Mi Fotomulta Clara` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
