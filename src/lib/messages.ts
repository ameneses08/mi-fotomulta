import {
  CHALLENGE_MESSAGES,
  HOLDER_LABELS,
  REFUND_MESSAGES,
  REFUND_STAGES,
  TRACKER_STAGES,
} from "@/data/statusMessages";
import { fillTemplate, formatCOP } from "@/lib/format";
import type {
  ChallengeCase,
  ChallengeStatus,
  RefundCase,
  RefundStatus,
  StageState,
  TrackerStage,
} from "@/types";

export function challengeMessage(challenge: ChallengeCase): string {
  return fillTemplate(CHALLENGE_MESSAGES[challenge.status], {
    case_id: challenge.id,
    ...challenge.messageValues,
  });
}

export function refundMessage(refund: RefundCase): string {
  return fillTemplate(REFUND_MESSAGES[refund.status], {
    fine_id: refund.fineId,
    amount: formatCOP(refund.amount),
    ...refund.messageValues,
  });
}

export function holderLabel(challenge: ChallengeCase): string {
  return fillTemplate(HOLDER_LABELS[challenge.status], { holder: challenge.holder });
}

const STAGE_INDEX: Record<ChallengeStatus, number> = {
  Received: 0,
  Validating: 1,
  "Needs correction": 1,
  "Hearing scheduled": 2,
  Decided: 3,
  Appealed: 3,
  Closed: 4,
};

export interface TrackerStep {
  stage: TrackerStage;
  state: StageState;
}

/** Maps a challenge status onto the five citizen tracker stages. */
export function trackerSteps(challenge: ChallengeCase): TrackerStep[] {
  const current = STAGE_INDEX[challenge.status];
  return TRACKER_STAGES.map((stage, index) => {
    if (index === current) return { stage, state: "current" };
    if (index > current) return { stage, state: "upcoming" };
    const skippedHearing = stage === "Hearing" && !challenge.hadHearing;
    return { stage, state: skippedHearing ? "skipped" : "done" };
  });
}

const REFUND_STAGE_INDEX: Record<RefundStatus, number> = {
  "On hold": 0,
  Eligible: 1,
  Rejected: 1,
  Appealed: 1,
  "Verifying payment details": 2,
  "Needs correction": 2,
  Approved: 3,
  Paid: 4,
};

/** Maps a refund status onto the five refund tracker stages. */
export function refundSteps(refund: RefundCase): { label: string; state: StageState }[] {
  const current = REFUND_STAGE_INDEX[refund.status];
  return REFUND_STAGES.map((label, index) => ({
    label,
    state: index < current ? "done" : index === current ? "current" : "upcoming",
  }));
}
