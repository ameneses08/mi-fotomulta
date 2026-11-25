import type {
  ChallengeStatus,
  ClockRisk,
  FineStatus,
  RefundStatus,
  RuleResult,
  Tone,
  TrackerStage,
} from "@/types";

/** Citizen-facing status messages. {placeholders} are filled by lib/messages.ts. */
export const CHALLENGE_MESSAGES: Record<ChallengeStatus, string> = {
  Received:
    "We received your challenge. Your reference is {case_id}. We are checking your details.",
  Validating:
    "We are checking your fine, your vehicle and the camera. You do not need to do anything.",
  "Needs correction": "We need one correction: {what}. Send it by {date} to keep your case open.",
  "Hearing scheduled":
    "Your hearing is on {date} at {time}, {virtual_link_or_address}. Bring your ID.",
  Decided: "Decision: {outcome}. Reason: {plain_reason}. You can appeal until {date}.",
  Appealed: "We received your appeal on {date}. We will tell you the decision here.",
  Closed: "Your case is closed: {reason}. {next_step_if_any}",
};

export const REFUND_MESSAGES: Record<RefundStatus, string> = {
  Eligible:
    "Your fine {fine_id} was revoked. Your refund of {amount} is ready: confirm a bank account in your name to receive it.",
  "On hold":
    "We recorded your payment. Your refund depends on a decision by the competent authority. We will tell you when that changes.",
  "Verifying payment details": "We are checking that the bank account is in your name.",
  "Needs correction":
    "We could not verify the account: {reason}. Add an account in your name or choose another way to be paid.",
  Approved: "Your refund of {amount} is approved. Expected payment by {date}.",
  Paid: "We paid {amount} on {date} to the account ending {last4}.",
  Rejected: "We could not approve this refund: {reason}. You can appeal until {date}.",
  Appealed: "We received your appeal on {date}. We will tell you the decision here.",
};

export const TRACKER_STAGES: readonly TrackerStage[] = [
  "Submitted",
  "Being checked",
  "Hearing",
  "Decision",
  "Closed",
];

export const REFUND_STAGES: readonly string[] = [
  "On hold",
  "Eligible",
  "Verifying account",
  "Approved",
  "Paid",
];

/** "Who has your case now" on the citizen tracker. {holder} is the assigned person. */
export const HOLDER_LABELS: Record<ChallengeStatus, string> = {
  Received: "Automatic checks",
  Validating: "{holder}",
  "Needs correction": "You – we are waiting for your correction",
  "Hearing scheduled": "{holder}",
  Decided: "Decision issued by {holder}",
  Appealed: "Appeals team",
  Closed: "No one – the case is closed",
};

export const FINE_STATUS_TONES: Record<FineStatus, Tone> = {
  "Pending payment": "warning",
  Paid: "success",
  "Under review": "info",
  "Challenge in progress": "info",
  Revoked: "success",
  "Refund on hold": "warning",
  "Another authority": "neutral",
};

export const CHALLENGE_STATUS_TONES: Record<ChallengeStatus, Tone> = {
  Received: "info",
  Validating: "info",
  "Needs correction": "warning",
  "Hearing scheduled": "info",
  Decided: "success",
  Appealed: "info",
  Closed: "neutral",
};

export const REFUND_STATUS_TONES: Record<RefundStatus, Tone> = {
  Eligible: "success",
  "On hold": "warning",
  "Verifying payment details": "info",
  "Needs correction": "warning",
  Approved: "success",
  Paid: "success",
  Rejected: "danger",
  Appealed: "info",
};

export const RULE_RESULT_TONES: Record<RuleResult, Tone> = {
  Pass: "success",
  Flag: "warning",
  Fail: "danger",
};

export const CLOCK_RISK_TONES: Record<ClockRisk, Tone> = {
  "On track": "success",
  "At risk": "warning",
  Overdue: "danger",
};

export const OTHER_AUTHORITY_NOTE = "Issued by another authority – contact them directly";

/** The next step shown on each fine card in "My fines". */
export const FINE_NEXT_ACTIONS: Record<FineStatus, string> = {
  "Pending payment": "Pay or challenge",
  Paid: "View details",
  "Under review": "See why",
  "Challenge in progress": "Track my challenge",
  Revoked: "View details",
  "Refund on hold": "View my refund",
  "Another authority": "How to contact Soacha",
};

/** Notification sent to each citizen when a bulk-revocation act is applied to their fine. */
export const REVOCATION_NOTICES = {
  unpaid:
    "Your fine {fine_id} of {amount} has been revoked by {act_number}: camera {camera} was not authorised on {date}. You do not need to pay it.",
  paid: "Your fine {fine_id} of {amount} has been revoked by {act_number}: camera {camera} was not authorised on {date}. You already paid it, so your refund is ready: confirm a bank account in your name in Mi Fotomulta Clara.",
};
