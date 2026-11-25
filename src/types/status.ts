export type ChallengeStatus =
  | "Received"
  | "Validating"
  | "Needs correction"
  | "Hearing scheduled"
  | "Decided"
  | "Appealed"
  | "Closed";

export type RefundStatus =
  | "Eligible"
  | "On hold"
  | "Verifying payment details"
  | "Needs correction"
  | "Approved"
  | "Paid"
  | "Rejected"
  | "Appealed";

/** Status shown to the citizen for a fine. Always derived, never stored. */
export type FineStatus =
  | "Pending payment"
  | "Paid"
  | "Under review"
  | "Challenge in progress"
  | "Revoked"
  | "Refund on hold"
  | "Another authority";

export type DecisionOutcome = "Revoked" | "Upheld" | "Partly upheld";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

/** A = automated, S = AI-supported with human sign-off, H = human only. */
export type RuleLevel = "A" | "S" | "H";

export type RuleResult = "Pass" | "Flag" | "Fail";

export type RuleId =
  "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7" | "R8" | "R9" | "R10" | "R11" | "R12";

export type TrackerStage = "Submitted" | "Being checked" | "Hearing" | "Decision" | "Closed";

export type StageState = "done" | "current" | "upcoming" | "skipped";

export type LegalActStatus = "Draft" | "In force";

export type ClockRisk = "On track" | "At risk" | "Overdue";

export type DecisionKind =
  "Revoke" | "Uphold" | "Partly uphold" | "Schedule hearing" | "Request correction";

export type RefundDecisionKind = "Approve" | "Request correction" | "Reject";

export type AssistantIntent =
  "statusCheck" | "challengeDeadline" | "whyUnderReview" | "refundTiming";
