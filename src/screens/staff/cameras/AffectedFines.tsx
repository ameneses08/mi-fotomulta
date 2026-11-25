import { StatusBadge } from "@/components/StatusBadge";
import { FINE_STATUS_TONES } from "@/data/statusMessages";
import { formatCOP, formatDate } from "@/lib/format";
import { deriveFineStatus, type RulesContext } from "@/lib/rules";
import type { Fine } from "@/types";

export function AffectedFines({ fines, ctx }: { fines: Fine[]; ctx: RulesContext }) {
  if (!fines.length)
    return <p className="text-sm text-muted-foreground">No fines outside the authorisation.</p>;
  return (
    <ul className="grid gap-2">
      {fines.map((fine) => {
        const status = deriveFineStatus(fine, ctx);
        return (
          <li key={fine.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-medium">{fine.id}</span>
            <span>{fine.ownerName}</span>
            <span className="text-muted-foreground">{formatDate(fine.infractionDate)}</span>
            <span>{formatCOP(fine.amount)}</span>
            <StatusBadge text={status} tone={FINE_STATUS_TONES[status]} />
          </li>
        );
      })}
    </ul>
  );
}
