import { RULES } from "@/data/ruleCatalogue";
import { formatDate } from "@/lib/format";
import { addWorkingDays, SLA_CONFIG } from "@/lib/sla";
import type {
  Camera,
  ChallengeCase,
  Fine,
  FineStatus,
  IsoDate,
  LegalAct,
  RefundCase,
  RuleCheck,
  RuleId,
  RuleLevel,
  RuleResult,
} from "@/types";

export const RULES_CONFIG = {
  /** R12: refunds above this amount always need a human approval. */
  refundHumanThreshold: 2_000_000,
} as const;

export interface RulesContext {
  fines: readonly Fine[];
  cameras: readonly Camera[];
  legalActs: readonly LegalAct[];
  challenges: readonly ChallengeCase[];
  refunds: readonly RefundCase[];
}

export type RefundEligibility = "Eligible" | "On hold" | "Not eligible";

const OPEN_CHALLENGE = new Set(["Received", "Validating", "Needs correction", "Hearing scheduled"]);

function check(ruleId: RuleId, result: RuleResult, detail: string, level?: RuleLevel): RuleCheck {
  const rule = RULES[ruleId];
  return { ruleId, title: rule.title, level: level ?? rule.level, result, detail };
}

export function findCamera(ctx: RulesContext, cameraId: string): Camera | undefined {
  return ctx.cameras.find((camera) => camera.id === cameraId);
}

export function findFine(ctx: RulesContext, fineId: string): Fine | undefined {
  return ctx.fines.find((fine) => fine.id === fineId);
}

/** R2 */
export function isOtherAuthority(fine: Fine): boolean {
  return fine.authorityId !== "SDM";
}

/** R4 */
export function isCameraAuthorisedOn(camera: Camera | undefined, date: IsoDate): boolean {
  if (!camera?.authorisedFrom) return false;
  return (
    camera.authorisedFrom <= date && (!camera.authorisedUntil || date <= camera.authorisedUntil)
  );
}

export function isFineOnNonCompliantCamera(fine: Fine, ctx: RulesContext): boolean {
  return !isCameraAuthorisedOn(findCamera(ctx, fine.cameraId), fine.infractionDate);
}

/** R10: a rule that depends on a legal act applies only while the act is in force. */
export function actRevokingFine(fine: Fine, ctx: RulesContext): LegalAct | undefined {
  if (isOtherAuthority(fine) || !isFineOnNonCompliantCamera(fine, ctx)) return undefined;
  return ctx.legalActs.find(
    (act) => act.status === "In force" && act.cameraIds.includes(fine.cameraId),
  );
}

export function isRevokedByDecision(fine: Fine, ctx: RulesContext): boolean {
  return ctx.challenges.some(
    (c) =>
      c.fineId === fine.id &&
      c.outcome === "Revoked" &&
      (c.status === "Decided" || c.status === "Closed"),
  );
}

export function isFineRevoked(fine: Fine, ctx: RulesContext): boolean {
  return Boolean(actRevokingFine(fine, ctx)) || isRevokedByDecision(fine, ctx);
}

export function deriveFineStatus(fine: Fine, ctx: RulesContext): FineStatus {
  if (isOtherAuthority(fine)) return "Another authority";
  if (isFineRevoked(fine, ctx)) return "Revoked";
  if (ctx.challenges.some((c) => c.fineId === fine.id && OPEN_CHALLENGE.has(c.status))) {
    return "Challenge in progress";
  }
  if (isFineOnNonCompliantCamera(fine, ctx)) return fine.paidOn ? "Refund on hold" : "Under review";
  return fine.paidOn ? "Paid" : "Pending payment";
}

/** R11: paid + revoked + not yet refunded → Eligible. Paid on a non-compliant camera, no act → On hold. */
export function deriveRefundEligibility(fine: Fine, ctx: RulesContext): RefundEligibility {
  if (!fine.paidOn || isOtherAuthority(fine)) return "Not eligible";
  const alreadyRefunded = ctx.refunds.some((r) => r.fineId === fine.id && r.status === "Paid");
  if (alreadyRefunded) return "Not eligible";
  if (isFineRevoked(fine, ctx)) return "Eligible";
  return isFineOnNonCompliantCamera(fine, ctx) ? "On hold" : "Not eligible";
}

function deadlineCheck(challenge: ChallengeCase, fine: Fine): RuleCheck {
  const deadline = addWorkingDays(fine.notificationDate, SLA_CONFIG.challengeWindowDays);
  return challenge.submittedOn <= deadline
    ? check(
        "R1",
        "Pass",
        `Filed on ${formatDate(challenge.submittedOn)}, deadline ${formatDate(deadline)}.`,
      )
    : check(
        "R1",
        "Fail",
        `Filed after the deadline of ${formatDate(deadline)}. Route for review; the right to be heard remains.`,
      );
}

function duplicateCheck(challenge: ChallengeCase, ctx: RulesContext): RuleCheck {
  const others = ctx.challenges.filter(
    (c) => c.fineId === challenge.fineId && c.id !== challenge.id,
  );
  return others.length
    ? check("R3", "Flag", `Also filed as ${others.map((c) => c.id).join(", ")}.`)
    : check("R3", "Pass", "No other case on this fine.");
}

function cameraCheck(fine: Fine, ctx: RulesContext): RuleCheck {
  return isFineOnNonCompliantCamera(fine, ctx)
    ? check(
        "R4",
        "Fail",
        `Camera ${fine.cameraId} was not authorised on ${formatDate(fine.infractionDate)} (ANSV).`,
      )
    : check(
        "R4",
        "Pass",
        `Camera ${fine.cameraId} was authorised on ${formatDate(fine.infractionDate)} (ANSV).`,
      );
}

function notificationCheck(fine: Fine): RuleCheck {
  const limit = addWorkingDays(fine.infractionDate, SLA_CONFIG.notificationWindowDays);
  return fine.notificationDate <= limit
    ? check("R5", "Pass", `Notified on ${formatDate(fine.notificationDate)}, within the window.`)
    : check(
        "R5",
        "Flag",
        `Notified on ${formatDate(fine.notificationDate)}, after ${formatDate(limit)}. A human decides.`,
      );
}

function plateCheck(fine: Fine): RuleCheck {
  return fine.imagePlate === fine.plate
    ? check("R6", "Pass", `Image plate ${fine.imagePlate} matches RUNT.`)
    : check(
        "R6",
        "Flag",
        `Image reads ${fine.imagePlate}, RUNT has ${fine.plate}. Confirm the image.`,
      );
}

function evidenceCheck(challenge: ChallengeCase): RuleCheck {
  if (challenge.representative) {
    return check(
      "R9",
      "Flag",
      `Templated argument shared with other ${challenge.representative} cases. Review individually.`,
    );
  }
  return challenge.evidence.length
    ? check("R9", "Pass", `${challenge.evidence.length} new document(s) attached.`)
    : check("R9", "Flag", "No supporting documents attached.");
}

function bulkCheck(fine: Fine, ctx: RulesContext): RuleCheck {
  const act = actRevokingFine(fine, ctx);
  return act
    ? check("R10", "Pass", `Covered by ${act.number}, in force. The fine is revoked.`)
    : check("R10", "Flag", "Camera non-compliant, but no legal act is in force yet.");
}

export function evaluateChallengeRules(challenge: ChallengeCase, ctx: RulesContext): RuleCheck[] {
  const fine = findFine(ctx, challenge.fineId);
  if (!fine) return [];
  const checks = [
    deadlineCheck(challenge, fine),
    duplicateCheck(challenge, ctx),
    cameraCheck(fine, ctx),
    notificationCheck(fine),
    plateCheck(fine),
  ];
  if (challenge.reason === "I wasn't driving") {
    checks.push(
      check(
        "R7",
        "Flag",
        "The owner cannot be presumed to be the driver. An inspector must decide.",
      ),
    );
  }
  if (challenge.reason === "Vehicle sold before the fine") {
    checks.push(check("R8", "Flag", "Sale not registered in RUNT. An inspector must decide."));
  }
  checks.push(evidenceCheck(challenge));
  if (isFineOnNonCompliantCamera(fine, ctx)) checks.push(bulkCheck(fine, ctx));
  return checks;
}

function bankCheck(refund: RefundCase): RuleCheck {
  const account = refund.bankAccount;
  if (!account) return check("R12", "Flag", "No bank account provided yet.");
  const highAmount = refund.amount > RULES_CONFIG.refundHumanThreshold;
  if (account.holderDocument !== refund.claimantDocument) {
    return check("R12", "Fail", `Account holder ${account.holderName} is not the claimant.`, "H");
  }
  return highAmount
    ? check("R12", "Flag", "Holder verified. Amount above threshold: a human approves.", "H")
    : check("R12", "Pass", `Account ending ${account.last4} is in the claimant's name.`);
}

export function evaluateRefundRules(refund: RefundCase, ctx: RulesContext): RuleCheck[] {
  const fine = findFine(ctx, refund.fineId);
  if (!fine) return [];
  const eligibility = deriveRefundEligibility(fine, ctx);
  const r11: Record<RefundEligibility, RuleCheck> = {
    Eligible: check("R11", "Pass", "Paid and revoked. No refund paid yet."),
    "On hold": check(
      "R11",
      "Flag",
      "Paid, camera non-compliant, but no act in force: refund on hold.",
    ),
    "Not eligible": check("R11", "Fail", "The fine is not revoked."),
  };
  return [r11[eligibility], bankCheck(refund)];
}

export function flaggedRules(checks: readonly RuleCheck[]): RuleId[] {
  return checks.filter((c) => c.result !== "Pass").map((c) => c.ruleId);
}
