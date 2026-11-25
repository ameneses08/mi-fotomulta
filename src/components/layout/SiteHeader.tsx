import { Link } from "@tanstack/react-router";
import { Info, ShieldCheck } from "lucide-react";

export const PROTOTYPE_BANNER =
  "Academic prototype – not an official service of the Alcaldía de Bogotá. AI responses are simulated.";

export function SiteHeader() {
  return (
    <>
      <div className="prototype-banner" role="note">
        <Info size={15} aria-hidden="true" />
        <span>{PROTOTYPE_BANNER}</span>
      </div>
      <div className="site-header-wrap">
        <header className="site-header">
          <Link to="/" className="brand" aria-label="Mi Fotomulta Clara home">
            <span className="brand-symbol">
              <ShieldCheck size={38} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <span>
              <span className="brand-name">Mi Fotomulta Clara</span>
              <span className="brand-caption block">Secretaría Distrital de Movilidad</span>
            </span>
          </Link>
          <div className="header-meta">
            <span className="movilidad-tag">Secretaría de Movilidad</span>
            <span className="prototype-label">Academic prototype</span>
          </div>
        </header>
      </div>
    </>
  );
}
