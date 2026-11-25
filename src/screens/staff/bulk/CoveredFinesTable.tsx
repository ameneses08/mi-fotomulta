import { StatusBadge } from "@/components/StatusBadge";
import { FINE_STATUS_TONES } from "@/data/statusMessages";
import { formatCOP, formatDate } from "@/lib/format";
import { deriveFineStatus, type RulesContext } from "@/lib/rules";
import type { Fine } from "@/types";

export function CoveredFinesTable({ fines, ctx }: { fines: Fine[]; ctx: RulesContext }) {
  return (
    <div className="table-wrap">
      <table className="queue-table">
        <caption className="sr-only">Fines from the irregular cameras</caption>
        <thead>
          <tr>
            {["Fine", "Citizen", "Camera", "Recorded", "Amount", "Paid", "Status"].map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fines.map((fine) => {
            const status = deriveFineStatus(fine, ctx);
            return (
              <tr key={fine.id}>
                <td className="font-medium">{fine.id}</td>
                <td>{fine.ownerName}</td>
                <td>{fine.cameraId}</td>
                <td>{formatDate(fine.infractionDate)}</td>
                <td>{formatCOP(fine.amount)}</td>
                <td>{fine.paidOn ? "Yes – refund due" : "No"}</td>
                <td>
                  <StatusBadge text={status} tone={FINE_STATUS_TONES[status]} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
