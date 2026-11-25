import { Link } from "@tanstack/react-router";
import { ClipboardList, FileText, Wallet } from "lucide-react";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { OTHER_AUTHORITY_NOTE } from "@/data/statusMessages";
import { useAppStore } from "@/store/appStore";
import type { Fine, FineStatus } from "@/types";
import { PaymentDialog } from "./PaymentDialog";

interface FineActionsProps {
  fine: Fine;
  status: FineStatus;
}

/** Context buttons for a fine. One primary action at most. */
export function FineActions({ fine, status }: FineActionsProps) {
  const challenge = useAppStore((s) => s.challenges.find((c) => c.fineId === fine.id));
  const refund = useAppStore((s) => s.refunds.find((r) => r.fineId === fine.id));

  if (status === "Another authority") return <Notice>{OTHER_AUTHORITY_NOTE}</Notice>;

  return (
    <div className="actions-stack">
      {challenge && (
        <Button asChild>
          <Link to="/citizen/cases/$id" params={{ id: challenge.id }}>
            <ClipboardList size={18} aria-hidden="true" />
            Track my challenge
          </Link>
        </Button>
      )}
      {refund && (
        <Button asChild variant={challenge ? "outline" : "default"}>
          <Link to="/citizen/refunds/$id" params={{ id: refund.id }}>
            <Wallet size={18} aria-hidden="true" />
            {status === "Revoked" ? "Get my money back" : "View my refund"}
          </Link>
        </Button>
      )}
      {!fine.paidOn && status !== "Revoked" && (
        <>
          <Button asChild variant={challenge ? "outline" : "default"}>
            <Link to="/citizen/fines/$id/challenge" params={{ id: fine.id }}>
              <FileText size={18} aria-hidden="true" />
              {challenge ? "Submit a new challenge" : "Challenge this fine"}
            </Link>
          </Button>
          <PaymentDialog fine={fine} />
        </>
      )}
    </div>
  );
}
