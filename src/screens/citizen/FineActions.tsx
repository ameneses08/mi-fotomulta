import { Link, useNavigate } from "@tanstack/react-router";
import { ClipboardList, FileText, Scale, Wallet } from "lucide-react";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { OTHER_AUTHORITY_NOTE } from "@/data/statusMessages";
import { fineActions } from "@/lib/fineActions";
import { useAppStore } from "@/store/appStore";
import type { Fine, FineStatus } from "@/types";
import { PaymentDialog } from "./PaymentDialog";

interface FineActionsProps {
  fine: Fine;
  status: FineStatus;
}

/** Context buttons for a fine, chosen by lib/fineActions. The first one is the primary action. */
export function FineActions({ fine, status }: FineActionsProps) {
  const navigate = useNavigate();
  const challenge = useAppStore((s) => s.challenges.find((c) => c.fineId === fine.id));
  const refund = useAppStore((s) => s.refunds.find((r) => r.fineId === fine.id));
  const appeal = useAppStore((s) => s.appealChallenge);
  const actions = fineActions(fine, status, challenge, refund);

  if (status === "Another authority") return <Notice>{OTHER_AUTHORITY_NOTE}</Notice>;
  const variant = (action: (typeof actions)[number]) =>
    actions[0] === action ? "default" : "outline";

  return (
    <div className="actions-stack">
      {challenge && actions.includes("track") && (
        <Button asChild variant={variant("track")}>
          <Link to="/citizen/cases/$id" params={{ id: challenge.id }}>
            <ClipboardList size={18} aria-hidden="true" />
            Track my challenge
          </Link>
        </Button>
      )}
      {challenge && actions.includes("appeal") && (
        <Button
          variant="outline"
          onClick={() => {
            if (!appeal(challenge.id))
              void navigate({ to: "/citizen/cases/$id", params: { id: challenge.id } });
          }}
        >
          <Scale size={18} aria-hidden="true" />
          Appeal the decision
        </Button>
      )}
      {refund && actions.includes("refund") && (
        <Button asChild variant={variant("refund")}>
          <Link to="/citizen/refunds/$id" params={{ id: refund.id }}>
            <Wallet size={18} aria-hidden="true" />
            {status === "Revoked" ? "Get my money back" : "View my refund"}
          </Link>
        </Button>
      )}
      {actions.includes("challenge") && (
        <Button asChild variant={variant("challenge")}>
          <Link to="/citizen/fines/$id/challenge" params={{ id: fine.id }}>
            <FileText size={18} aria-hidden="true" />
            Challenge this fine
          </Link>
        </Button>
      )}
      {actions.includes("pay") && <PaymentDialog fine={fine} />}
    </div>
  );
}
