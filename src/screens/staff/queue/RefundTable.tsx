import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { REFUND_STATUS_TONES } from "@/data/statusMessages";
import { formatCOP } from "@/lib/format";
import type { RefundRow } from "@/lib/queue";
import { FlagList } from "./FlagList";

export function RefundTable({ rows }: { rows: RefundRow[] }) {
  return (
    <div className="table-wrap">
      <table className="queue-table">
        <caption className="sr-only">Refunds</caption>
        <thead>
          <tr>
            <th scope="col">Refund</th>
            <th scope="col">Claimant</th>
            <th scope="col">Amount</th>
            <th scope="col">Status</th>
            <th scope="col">Flags</th>
            <th scope="col">
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ refund, flags }) => (
            <tr key={refund.id}>
              <td className="font-medium">{refund.id}</td>
              <td>
                <div>{refund.claimantName}</div>
                <div className="text-sm text-muted-foreground">Fine {refund.fineId}</div>
              </td>
              <td>{formatCOP(refund.amount)}</td>
              <td>
                <StatusBadge text={refund.status} tone={REFUND_STATUS_TONES[refund.status]} />
              </td>
              <td>
                <FlagList flags={flags} />
              </td>
              <td>
                <Link to="/staff/cases/$id" params={{ id: refund.id }} className="table-link">
                  Open
                  <ArrowRight size={15} aria-hidden="true" />
                  <span className="sr-only"> refund {refund.id}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
