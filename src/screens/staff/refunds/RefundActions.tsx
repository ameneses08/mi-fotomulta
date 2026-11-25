import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import type { RefundCase, RefundDecisionKind } from "@/types";

const LABELS: Record<RefundDecisionKind, string> = {
  Approve: "Approve",
  Reject: "Reject",
  "Request correction": "Request documents",
};
const REASON_PROMPTS: Record<RefundDecisionKind, string> = {
  Approve: "Why you approve (how you resolved the checks)",
  Reject: "Reason for rejecting",
  "Request correction": "Which documents the claimant must send",
};

/** Every action needs a written reason; a flag is only resolved by a person's decision. */
export function RefundActions({ refund }: { refund: RefundCase }) {
  const decide = useAppStore((s) => s.decideRefundCase);
  const [kind, setKind] = useState<RefundDecisionKind | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (refund.status !== "Verifying payment details") {
    return (
      <p className="text-sm text-muted-foreground">No action available while {refund.status}.</p>
    );
  }
  if (!kind) {
    return (
      <div className="flex flex-wrap gap-2">
        {(Object.keys(LABELS) as RefundDecisionKind[]).map((option) => (
          <Button
            key={option}
            size="sm"
            variant={option === "Approve" ? "default" : "outline"}
            className="min-h-11"
            onClick={() => setKind(option)}
          >
            {LABELS[option]}
          </Button>
        ))}
      </div>
    );
  }
  return (
    <form
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setError(decide(refund.id, kind, reason) ?? "");
      }}
    >
      <label className="form-field mt-0 text-sm">
        {REASON_PROMPTS[kind]} <span className="text-xs font-normal text-danger">(required)</span>
        <textarea
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-required="true"
        />
      </label>
      {error && (
        <p className="error-text mt-0" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="min-h-11">
          Confirm: {LABELS[kind]}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="min-h-11"
          onClick={() => setKind(null)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
