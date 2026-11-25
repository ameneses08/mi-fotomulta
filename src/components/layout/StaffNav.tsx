import { Link } from "@tanstack/react-router";
import { Cctv, Inbox, Landmark, ScrollText, Wallet, type LucideIcon } from "lucide-react";

export type StaffSection = "inbox" | "refunds" | "cameras" | "bulk" | "audit";

interface NavItem {
  section: StaffSection;
  label: string;
  icon: LucideIcon;
  to: "/staff" | "/staff/refunds" | "/staff/cameras" | "/staff/bulk-revocation" | "/staff/audit";
}

const NAV: NavItem[] = [
  { section: "inbox", label: "Inbox", icon: Inbox, to: "/staff" },
  { section: "refunds", label: "Refunds", icon: Wallet, to: "/staff/refunds" },
  { section: "cameras", label: "Cameras", icon: Cctv, to: "/staff/cameras" },
  { section: "bulk", label: "Bulk revocation", icon: Landmark, to: "/staff/bulk-revocation" },
  { section: "audit", label: "Audit log", icon: ScrollText, to: "/staff/audit" },
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
