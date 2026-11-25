import { Link } from "@tanstack/react-router";
import { ArrowLeft, CircleHelp } from "lucide-react";
import type { ReactNode } from "react";

export function HelpFooter() {
  return (
    <footer className="help-footer">
      <CircleHelp size={18} aria-hidden="true" />
      <p>Need help? Visit a Centro de Servicios de Movilidad or call Línea 195.</p>
    </footer>
  );
}

interface CitizenLayoutProps {
  children: ReactNode;
  /** Where the back link goes. Omit on the citizen home. */
  back?: { to: "/" | "/citizen"; label: string };
}

/** Mobile-first column, max 420px, centred on desktop. */
export function CitizenLayout({
  children,
  back = { to: "/citizen", label: "My fines" },
}: CitizenLayoutProps) {
  return (
    <main className="citizen-shell">
      <div className="page-top">
        <Link to={back.to} className="back-link">
          <ArrowLeft size={17} aria-hidden="true" />
          {back.label}
        </Link>
        <span className="source-tag">Fictional citizen</span>
      </div>
      {children}
      <HelpFooter />
    </main>
  );
}
