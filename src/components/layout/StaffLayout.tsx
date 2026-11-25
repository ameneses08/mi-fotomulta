import { Link } from "@tanstack/react-router";
import { ArrowLeft, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { INSPECTOR_NAME } from "@/data/mockData";
import { DemoControls } from "./DemoControls";
import { StaffNav, type StaffSection } from "./StaffNav";

interface StaffLayoutProps {
  children: ReactNode;
  active: StaffSection;
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
        <StaffNav active={active} />
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
