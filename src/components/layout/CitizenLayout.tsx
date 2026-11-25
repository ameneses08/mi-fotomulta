import { Link } from "@tanstack/react-router";
import { ArrowLeft, CircleHelp, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { CitizenNav } from "./CitizenNav";

export function HelpFooter() {
  return (
    <footer className="help-footer">
      <CircleHelp size={18} aria-hidden="true" />
      <p>Need help? Visit a Centro de Servicios de Movilidad or call Línea 195.</p>
    </footer>
  );
}

/** Right-hand column on wide containers. */
export function CitizenAside() {
  return (
    <section className="panel" aria-labelledby="aside-help">
      <h2 id="aside-help" className="flex items-center gap-2 font-semibold">
        <Phone size={17} aria-hidden="true" />
        Talk to a person
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Call Línea 195 or visit a Centro de Servicios de Movilidad.
      </p>
    </section>
  );
}

interface CitizenLayoutProps {
  children: ReactNode;
  back?: { to: "/citizen" | "/citizen/cases"; label: string };
}

/**
 * Container-query layout: wide containers get a main column and a sticky right column; narrow
 * containers (phones and the /demo phone frame) stack everything in one column.
 */
export function CitizenLayout({ children, back }: CitizenLayoutProps) {
  return (
    <div className="@container citizen-app">
      <CitizenNav />
      <div className="citizen-body @4xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="@container min-w-0">
          {back && (
            <Link to={back.to} className="back-link mb-3">
              <ArrowLeft size={17} aria-hidden="true" />
              {back.label}
            </Link>
          )}
          {children}
          <HelpFooter />
        </main>
        <aside className="citizen-aside hidden @4xl:block">
          <CitizenAside />
        </aside>
      </div>
    </div>
  );
}
