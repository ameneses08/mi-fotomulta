import { CheckCircle2, XCircle } from "lucide-react";
import type { AnalysisFinding } from "@/types";

/** Shows who reviewed a flag. (Confirm / dismiss actions are added with the audit log.) */
export function FindingReviewControls({ finding }: { finding: AnalysisFinding }) {
  if (finding.reviewStatus === "Pending") {
    return <p className="mt-2 text-xs text-muted-foreground">Waiting for an inspector's review.</p>;
  }
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
