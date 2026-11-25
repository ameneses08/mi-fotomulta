import { assistantScripts as T } from "@/data/aiScripts";
import { summariseCitizen } from "@/lib/citizenSummary";
import { fillTemplate, formatCOP, formatDate } from "@/lib/format";
import { holderLabel } from "@/lib/messages";
import { actRevokingFine, deriveFineStatus, findFine, type RulesContext } from "@/lib/rules";
import {
  addWorkingDays,
  expectedDateForChallenge,
  SLA_CONFIG,
  workingDaysBetween,
} from "@/lib/sla";
import type { AssistantIntent, ChallengeStatus, Citizen, FineStatus, IsoDate } from "@/types";

export interface AssistantAction {
  label: string;
  target: "fine" | "challenge" | "case" | "refund" | "fines";
  id: string;
}

export interface AssistantAnswer {
  text: string;
  action?: AssistantAction;
  humanExit: boolean;
}

export interface AssistantContext {
  rules: RulesContext;
  citizen: Citizen;
  today: IsoDate;
}

/** Fines each question is about when the citizen doesn't name one. */
export const DEFAULT_FINES = { deadline: "F-2041", why: "F-2042" } as const;

const INTENT_PATTERNS: [AssistantIntent, RegExp][] = [
  ["challengeDeadline", /how long|deadline|until when|time (left|to)|days (left|to)|plazo/i],
  ["refundTiming", /refund|money back|reembolso|devoluci/i],
  ["whyUnderReview", /why|under review|revis/i],
  ["statusCheck", /status|summary|overview|fotomulta|my fines|how many|estado/i],
];

/** Keyword matching onto the four supported questions. Null means "not supported". */
export function matchIntent(text: string): AssistantIntent | null {
  return INTENT_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}

/** "F-2041" if the text names a fine, otherwise the fallback. */
export function fineIdIn(text: string, fallback: string): string {
  return (
    text
      .match(/F-?\d{4}/i)?.[0]
      .toUpperCase()
      .replace(/^F-?/, "F-") ?? fallback
  );
}

const OPEN_STATUSES = new Set<ChallengeStatus>([
  "Received",
  "Validating",
  "Needs correction",
  "Hearing scheduled",
]);

const STATUS_ORDER: FineStatus[] = [
  "Pending payment",
  "Challenge in progress",
  "Under review",
  "Refund on hold",
  "Revoked",
  "Paid",
  "Another authority",
];

function statusCheck(ctx: AssistantContext): AssistantAnswer {
  const summary = summariseCitizen(ctx.rules, ctx.citizen.document);
  const open = ctx.rules.challenges.find(
    (c) => c.citizenDocument === ctx.citizen.document && OPEN_STATUSES.has(c.status),
  );
  const expected = open ? expectedDateForChallenge(open) : undefined;
  const holder = open ? holderLabel(open) : "";
  const detail = open
    ? fillTemplate(expected ? T.status.challengeDetail : T.status.challengeDetailNoDate, {
        holder: open.status === "Validating" ? `being checked by ${holder}` : holder.toLowerCase(),
        date: expected ? formatDate(expected) : "",
      })
    : "";
  const parts = STATUS_ORDER.filter((status) => summary.byStatus[status]?.length).map((status) =>
    fillTemplate(T.status.parts[status], {
      n: String(summary.byStatus[status]?.length ?? 0),
      detail,
    }),
  );
  const list =
    parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts.join("");
  return {
    text: fillTemplate(T.status.intro, { total: String(summary.total), parts: list }),
    action: open
      ? { label: T.actions.case, target: "case", id: open.id }
      : { label: T.actions.fines, target: "fines", id: "" },
    humanExit: true,
  };
}

function challengeDeadline(ctx: AssistantContext, fineId: string): AssistantAnswer {
  const fine = findFine(ctx.rules, fineId);
  if (!fine)
    return {
      text: fillTemplate(T.why.other, { fine_id: fineId, status: "not found" }),
      humanExit: true,
    };
  const status = deriveFineStatus(fine, ctx.rules);
  const challenge = ctx.rules.challenges.find((c) => c.fineId === fine.id);
  if (challenge) {
    return {
      text: fillTemplate(T.deadline.alreadyChallenged, {
        fine_id: fine.id,
        submitted: formatDate(challenge.submittedOn),
        case_id: challenge.id,
        status: challenge.outcome ? `${challenge.status} – ${challenge.outcome}` : challenge.status,
      }),
      action: { label: T.actions.case, target: "case", id: challenge.id },
      humanExit: false,
    };
  }
  if (status !== "Pending payment" && status !== "Under review") {
    return {
      text: fillTemplate(T.deadline.unavailable, { fine_id: fine.id, status }),
      humanExit: true,
    };
  }
  const deadline = addWorkingDays(fine.notificationDate, SLA_CONFIG.challengeWindowDays);
  const values = {
    fine_id: fine.id,
    deadline: formatDate(deadline),
    days_left: String(workingDaysBetween(ctx.today, deadline)),
    notified: formatDate(fine.notificationDate),
  };
  return {
    text: fillTemplate(ctx.today > deadline ? T.deadline.passed : T.deadline.open, values),
    action: {
      label: fillTemplate(T.actions.challenge, { id: fine.id }),
      target: "challenge",
      id: fine.id,
    },
    humanExit: true,
  };
}

function whyUnderReview(ctx: AssistantContext, fineId: string): AssistantAnswer {
  const fine = findFine(ctx.rules, fineId);
  const status = fine ? deriveFineStatus(fine, ctx.rules) : "not found";
  const action: AssistantAction = {
    label: fillTemplate(T.actions.fine, { id: fineId }),
    target: "fine",
    id: fineId,
  };
  if (!fine)
    return { text: fillTemplate(T.why.other, { fine_id: fineId, status }), humanExit: true };
  if (status === "Under review" || status === "Refund on hold") {
    return {
      text: fillTemplate(T.why.underReview, {
        fine_id: fine.id,
        camera: fine.cameraId,
        date: formatDate(fine.infractionDate),
      }),
      action,
      humanExit: true,
    };
  }
  if (status === "Revoked") {
    const act = actRevokingFine(fine, ctx.rules);
    return {
      text: fillTemplate(T.why.revoked, {
        fine_id: fine.id,
        by_act: act ? ` by ${act.number}` : "",
      }),
      action,
      humanExit: false,
    };
  }
  return {
    text: fillTemplate(T.why.other, { fine_id: fine.id, status }),
    action,
    humanExit: false,
  };
}

function refundTiming(ctx: AssistantContext): AssistantAnswer {
  const refund =
    ctx.rules.refunds.find(
      (r) => r.claimantDocument === ctx.citizen.document && r.status !== "Paid",
    ) ?? ctx.rules.refunds.find((r) => r.claimantDocument === ctx.citizen.document);
  if (!refund) return { text: T.noRefund, humanExit: true };
  const fine = findFine(ctx.rules, refund.fineId);
  return {
    text: fillTemplate(T.refund[refund.status], {
      amount: formatCOP(refund.amount),
      fine_id: refund.fineId,
      camera: fine?.cameraId ?? "",
      ...refund.messageValues,
    }),
    action: { label: T.actions.refund, target: "refund", id: refund.id },
    humanExit: refund.status === "On hold" || refund.status === "Rejected",
  };
}

/** Builds the answer for an intent from live state, so it stays right after any change. */
export function answerQuestion(
  intent: AssistantIntent,
  question: string,
  ctx: AssistantContext,
): AssistantAnswer {
  switch (intent) {
    case "statusCheck":
      return statusCheck(ctx);
    case "challengeDeadline":
      return challengeDeadline(ctx, fineIdIn(question, DEFAULT_FINES.deadline));
    case "whyUnderReview":
      return whyUnderReview(ctx, fineIdIn(question, DEFAULT_FINES.why));
    case "refundTiming":
      return refundTiming(ctx);
  }
}
