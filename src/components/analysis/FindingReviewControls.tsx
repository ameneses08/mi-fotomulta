import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import type { AnalysisFinding } from "@/types";

/** Confirm a flag or dismiss it as a false positive (reason required). Both are audited. */
export function FindingReviewControls({ finding }: { finding: AnalysisFinding }) {
  const review = useAppStore((s) => s.reviewFlag);
  const [dismissing, setDismissing] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (finding.reviewStatus !== "Pending") {
    const confirmed = finding.reviewStatus === "Confirmed";
    const Icon = confirmed ? CheckCircle2 : XCircle;
    return (
      <p className="review-note">
        <Icon size={14} aria-hidden="true" />
        {confirmed ? "Flag confirmed" : "Dismissed as false positive"} by {finding.reviewedBy}
        {finding.reviewReason ? `: ${finding.reviewReason}` : "."}
      </p>
    );
  }

  if (dismissing) {
    const reasonId = `${finding.id}-reason`;
    return (
      <form
        className="mt-2 grid gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError(review(finding.id, "Dismissed", reason) ?? "");
        }}
      >
        <label htmlFor={reasonId} className="text-xs font-semibold">
          Why is this a false positive? <span className="font-normal text-danger">(required)</span>
        </label>
        <textarea
          id={reasonId}
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" variant="outline" className="min-h-11">
            Dismiss flag
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="min-h-11"
            onClick={() => setDismissing(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        className="min-h-11"
        onClick={() => review(finding.id, "Confirmed", "")}
      >
        <CheckCircle2 size={15} aria-hidden="true" />
        Confirm flag
      </Button>
      <Button size="sm" variant="ghost" className="min-h-11" onClick={() => setDismissing(true)}>
        <XCircle size={15} aria-hidden="true" />
        Dismiss as false positive
      </Button>
    </div>
  );
}
