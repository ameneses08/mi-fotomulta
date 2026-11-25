import { AlertTriangle, Flag, FolderOpen, Wallet, type LucideIcon } from "lucide-react";
import type { QueueSummary } from "@/lib/queue";

const CARDS: { key: keyof QueueSummary; label: string; icon: LucideIcon }[] = [
  { key: "openCases", label: "Open cases", icon: FolderOpen },
  { key: "atRisk", label: "At risk of missing deadline", icon: AlertTriangle },
  { key: "refundsToApprove", label: "Refunds to approve", icon: Wallet },
  { key: "flagged", label: "Flags", icon: Flag },
];

export function SummaryCards({ summary }: { summary: QueueSummary }) {
  return (
    <ul className="summary-grid" aria-label="Queue summary">
      {CARDS.map(({ key, label, icon: Icon }) => (
        <li key={key} className="panel">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon size={16} aria-hidden="true" />
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold">{summary[key]}</p>
        </li>
      ))}
    </ul>
  );
}
