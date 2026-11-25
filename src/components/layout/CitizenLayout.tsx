import { Link } from "@tanstack/react-router";
import { ArrowLeft, CircleHelp } from "lucide-react";
import type { ReactNode } from "react";
import { AssistantLauncher } from "@/components/assistant/AssistantLauncher";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { CitizenNav } from "./CitizenNav";

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
  back?: { to: "/citizen" | "/citizen/cases"; label: string };
  /** Inside the /demo phone frame: no nav (it would leave the demo page). */
  embedded?: boolean;
}

/**
 * Container-query layout: wide containers get a main column and a sticky right column; narrow
 * containers (phones and the /demo phone frame) stack everything in one column.
 */
export function CitizenLayout({ children, back, embedded = false }: CitizenLayoutProps) {
  return (
    <div className={embedded ? "@container citizen-app embedded" : "@container citizen-app"}>
      {!embedded && <CitizenNav />}
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
          <AssistantPanel />
        </aside>
      </div>
      <div className="assistant-launcher">
        <AssistantLauncher />
      </div>
    </div>
  );
}
