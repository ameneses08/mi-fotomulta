import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { FINE_STATUS_TONES, OTHER_AUTHORITY_NOTE } from "@/data/statusMessages";
import { formatCOP, formatDate } from "@/lib/format";
import { useFineStatus } from "@/store/selectors";
import type { Fine } from "@/types";

export function FineCard({ fine }: { fine: Fine }) {
  const status = useFineStatus(fine.id);
  return (
    <article className="panel fine-card" aria-labelledby={`fine-${fine.id}`}>
      <div className="fine-meta">
        <span>{fine.id}</span>
        <span className="text-sm">{formatDate(fine.infractionDate)}</span>
      </div>
      <h3 className="fine-location" id={`fine-${fine.id}`}>
        {fine.location}
      </h3>
      <p className="text-sm text-muted-foreground">{fine.offence}</p>
      <div className="fine-amount">{formatCOP(fine.amount)}</div>
      {status === "Another authority" && (
        <p className="mb-3 text-sm text-muted-foreground">{OTHER_AUTHORITY_NOTE}</p>
      )}
      <div className="fine-card-bottom">
        {status && <StatusBadge text={status} tone={FINE_STATUS_TONES[status]} />}
        <Button variant="link" asChild className="px-1">
          <Link
            to="/citizen/fines/$id"
            params={{ id: fine.id }}
            aria-label={`View fine ${fine.id}`}
          >
            View
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
