import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { REFUND_STATUS_TONES } from "@/data/statusMessages";
import { formatCOP } from "@/lib/format";
import type { RefundQueueItem } from "@/lib/refundQueue";
import { RefundActions } from "./RefundActions";

export function RefundItem({ item }: { item: RefundQueueItem }) {
  const { refund, fraudFlags, holdReasons, section } = item;
  const notes = section === "fraud" ? fraudFlags : section === "held" ? holdReasons : [];
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
      {notes.length > 0 && (
        <ul className="grid gap-1 text-sm">
          {notes.map((note) => (
            <li key={note} className="flex items-start gap-2">
              <AlertTriangle
                size={15}
                className="mt-1 shrink-0 text-tone-warning"
                aria-hidden="true"
              />
              {note}
            </li>
          ))}
        </ul>
      )}
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
