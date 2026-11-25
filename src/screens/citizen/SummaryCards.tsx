import { Link } from "@tanstack/react-router";
import { CircleDollarSign, Hourglass, Wallet } from "lucide-react";
import { HERO_REFUND_ID } from "@/data/mockData";
import type { CitizenSummary } from "@/lib/citizenSummary";
import { formatCOP } from "@/lib/format";

export function CitizenSummaryCards({ summary }: { summary: CitizenSummary }) {
  return (
    <ul className="mt-6 grid gap-4 @2xl:grid-cols-3" aria-label="Summary">
      <li className="panel">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CircleDollarSign size={16} aria-hidden="true" />
          To pay
        </p>
        <p className="mt-2 text-2xl font-bold">{formatCOP(summary.toPay.amount)}</p>
        <p className="text-sm text-muted-foreground">
          {summary.toPay.count} fine{summary.toPay.count === 1 ? "" : "s"}
        </p>
      </li>
      <li className="panel">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Hourglass size={16} aria-hidden="true" />
          In progress
        </p>
        <p className="mt-2 text-2xl font-bold">{summary.inProgress}</p>
        <p className="text-sm text-muted-foreground">challenged or under review</p>
      </li>
      <li className="panel money-panel mt-0">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Wallet size={16} aria-hidden="true" />
          Money to recover
        </p>
        <p className="mt-2 text-2xl font-bold text-primary">{formatCOP(summary.moneyToRecover)}</p>
        <Link to="/citizen/refunds/$id" params={{ id: HERO_REFUND_ID }} className="table-link">
          View my refund
        </Link>
      </li>
    </ul>
  );
}
