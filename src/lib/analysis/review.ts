import { createAuditEntry } from "@/lib/transitions";
import type { AnalysisFinding, AuditEntry, FindingReview, IsoTimestamp } from "@/types";

export const REVIEW_ACTIONS = {
  Confirmed: "AI flag confirmed",
  Dismissed: "AI flag dismissed as false positive",
} as const;

export type ReviewResult =
  { ok: true; review: FindingReview; audit: AuditEntry } | { ok: false; error: string };

/** An inspector confirms a flag or dismisses it as a false positive (a reason is required). */
export function reviewFinding(
  finding: AnalysisFinding,
  decision: FindingReview["status"],
  reason: string,
  inspector: string,
  timestamp: IsoTimestamp,
): ReviewResult {
  if (finding.result !== "Flag") return { ok: false, error: "Only flags can be reviewed." };
  if (finding.reviewStatus !== "Pending")
    return { ok: false, error: "This flag was already reviewed." };
  const text = reason.trim();
  if (decision === "Dismissed" && !text)
    return { ok: false, error: "Explain why this is a false positive." };
  return {
    ok: true,
    review: {
      status: decision,
      reviewedBy: inspector,
      timestamp,
      ...(text ? { reason: text } : {}),
    },
    audit: createAuditEntry({
      caseId: finding.caseId,
      actor: inspector,
      action: REVIEW_ACTIONS[decision],
      reason: text ? `${finding.check}: ${text}` : finding.check,
      timestamp,
    }),
  };
}

/** Audit entry for ticking or unticking "Verified by inspector" on an extracted field. */
export function fieldVerificationEntry(
  caseId: string,
  label: string,
  verified: boolean,
  inspector: string,
  timestamp: IsoTimestamp,
): AuditEntry {
  return createAuditEntry({
    caseId,
    actor: inspector,
    action: verified ? "Extracted field verified" : "Field verification removed",
    reason: label,
    timestamp,
  });
}
