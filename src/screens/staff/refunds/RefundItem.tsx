import { Link } from "@tanstack/react-router";
import { AnalysisReport } from "@/components/analysis/AnalysisReport";
import { StatusBadge } from "@/components/StatusBadge";
import { REFUND_STATUS_TONES } from "@/data/statusMessages";
import { formatCOP } from "@/lib/format";
import type { RefundQueueItem } from "@/lib/refundQueue";
import { RefundActions } from "./RefundActions";

export function RefundItem({ item }: { item: RefundQueueItem }) {
  const { refund, section } = item;
  return (
    <li className="panel grid gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">
            {refund.id} · {formatCOP(refund.amount)}
          </p>
          <p className="text-sm text-muted-foreground">
            {refund.claimantName} · fine {refund.fineId}
            {refund.bankAccount && ` · ${refund.bankAccount.bank} ···${refund.bankAccount.last4}`}
          </p>
        </div>
        <StatusBadge text={refund.status} tone={REFUND_STATUS_TONES[refund.status]} />
      </div>
      <AnalysisReport analysis={item.analysis} compact />
      {section === "autoApproved" ? (
        <p className="text-sm text-muted-foreground">
          Approved automatically by the system (R11, R12). Sampled for audit.
        </p>
      ) : (
        <RefundActions refund={refund} />
      )}
      <Link
        to="/staff/cases/$id"
        params={{ id: refund.id }}
        className="table-link justify-self-start"
      >
        View checks and audit log
      </Link>
    </li>
  );
}
