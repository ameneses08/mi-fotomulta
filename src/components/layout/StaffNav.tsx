import { Link } from "@tanstack/react-router";
import { Inbox, Landmark, type LucideIcon } from "lucide-react";

export type StaffSection = "inbox" | "refunds" | "cameras" | "bulk" | "audit";

interface NavItem {
  section: StaffSection;
  label: string;
  icon: LucideIcon;
  to: "/staff" | "/staff/legal-acts";
}

const NAV: NavItem[] = [
  { section: "inbox", label: "Inbox", icon: Inbox, to: "/staff" },
  { section: "bulk", label: "Bulk revocation", icon: Landmark, to: "/staff/legal-acts" },
];

export function StaffNav({ active }: { active: StaffSection }) {
  return (
    <nav aria-label="Staff navigation">
      {NAV.map(({ section, label, icon: Icon, to }) => (
        <Link
          key={section}
          to={to}
          className="staff-nav"
          aria-current={active === section ? "page" : undefined}
        >
          <Icon size={18} aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
