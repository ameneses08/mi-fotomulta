import { CheckCircle2, Gavel } from "lucide-react";
import { useState } from "react";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import type { RefundCase, RefundDecisionKind } from "@/types";

const OPTIONS: RefundDecisionKind[] = ["Approve", "Request correction", "Reject"];

export function RefundDecisionPanel({ refund }: { refund: RefundCase }) {
  const decide = useAppStore((s) => s.decideRefundCase);
  const [kind, setKind] = useState<RefundDecisionKind>("Approve");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (refund.status !== "Verifying payment details") {
    return (
      <section className="staff-column decision-panel" aria-labelledby="refund-decision">
        <h2 id="refund-decision" className="column-title">
          Decision
        </h2>
        <Notice icon={CheckCircle2}>No decision needed while the refund is {refund.status}.</Notice>
      </section>
    );
  }

  return (
    <section className="staff-column decision-panel" aria-labelledby="refund-decision">
      <h2 id="refund-decision" className="column-title">
        Decision
      </h2>
      <fieldset>
        <legend className="text-sm font-semibold">Outcome</legend>
        {OPTIONS.map((option) => (
          <label key={option} className="choice compact">
            <input
              type="radio"
              name="refund-decision"
              checked={kind === option}
              onChange={() => setKind(option)}
            />
            {option}
          </label>
        ))}
      </fieldset>
      <label className="form-field">
        Reason for your decision <span className="text-xs font-normal text-danger">(required)</span>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-required="true"
        />
      </label>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      <Button
        className="mt-4 w-full"
        onClick={() => setError(decide(refund.id, kind, reason) ?? "")}
      >
        <Gavel size={18} aria-hidden="true" />
        Confirm decision
      </Button>
    </section>
  );
}
