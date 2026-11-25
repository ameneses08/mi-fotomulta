import { Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardList, FileText, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { INSPECTOR_NAME } from "@/data/mockData";
import { DemoControls } from "./DemoControls";

interface StaffLayoutProps {
  children: ReactNode;
  active: "queue" | "acts";
}

export function StaffLayout({ children, active }: StaffLayoutProps) {
  return (
    <div className="staff-shell">
      <aside className="staff-sidebar">
        <div className="flex items-center gap-2 font-semibold">
          <UserRound size={18} aria-hidden="true" />
          {INSPECTOR_NAME}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">SDM inspector · fictional</p>
        <nav aria-label="Staff navigation">
          <Link
            to="/staff"
            className="staff-nav"
            aria-current={active === "queue" ? "page" : undefined}
          >
            <ClipboardList size={18} aria-hidden="true" />
            Queue
          </Link>
          <Link
            to="/staff/legal-acts"
            className="staff-nav"
            aria-current={active === "acts" ? "page" : undefined}
          >
            <FileText size={18} aria-hidden="true" />
            Legal acts
          </Link>
        </nav>
        <Link to="/" className="back-link mt-8">
          <ArrowLeft size={16} aria-hidden="true" />
          Sign out
        </Link>
      </aside>
      <main className="staff-main">{children}</main>
      <DemoControls />
    </div>
  );
}
