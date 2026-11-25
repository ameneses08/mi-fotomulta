import type {
  Camera,
  ChallengeCase,
  Fine,
  FineStatus,
  IsoDate,
  LegalAct,
  RefundCase,
} from "@/types";

export const RULES_CONFIG = {
  /** R12: refunds above this amount always need a human approval. */
  refundHumanThreshold: 1_000_000,
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
