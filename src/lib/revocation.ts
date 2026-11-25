import { deriveFineStatus, isFineOnNonCompliantCamera, isOtherAuthority } from "@/lib/rules";
import type { RulesContext } from "@/lib/rules";
import { REVOCATION_NOTICES } from "@/data/statusMessages";
import { fillTemplate, formatCOP, formatDate } from "@/lib/format";
import { changeStatus, createAuditEntry } from "@/lib/transitions";
import type { AuditEntry, Fine, IsoTimestamp, LegalAct, RefundCase } from "@/types";

export interface ActPreview {
  affectedFines: Fine[];
  refundsToRelease: RefundCase[];
  totalRefund: number;
}

export type ActRegistration =
  | { ok: true; act: LegalAct; refunds: RefundCase[]; audit: AuditEntry[]; preview: ActPreview }
  | { ok: false; error: string };

/** R10: SDM fines from the act's cameras that were not authorised on the infraction date. */
export function previewAct(act: LegalAct, ctx: RulesContext): ActPreview {
  const affectedFines = ctx.fines.filter(
    (fine) =>
      act.cameraIds.includes(fine.cameraId) &&
      !isOtherAuthority(fine) &&
      isFineOnNonCompliantCamera(fine, ctx) &&
      deriveFineStatus(fine, ctx) !== "Revoked",
  );
  const affectedIds = new Set(affectedFines.map((fine) => fine.id));
  const refundsToRelease = ctx.refunds.filter(
    (refund) => affectedIds.has(refund.fineId) && refund.status === "On hold",
  );
  const totalRefund = refundsToRelease.reduce((sum, refund) => sum + refund.amount, 0);
  return { affectedFines, refundsToRelease, totalRefund };
}

/**
 * Registers an act as in force. The official signs once; the system then applies it to each
 * fine individually (one audit entry per fine) and releases each refund on hold (R11).
 */
export function registerAct(
  act: LegalAct,
  ctx: RulesContext,
  official: string,
  timestamp: IsoTimestamp,
): ActRegistration {
  if (act.status === "In force") return { ok: false, error: "This act is already in force." };
  if (!official.trim()) return { ok: false, error: "Type your full name to sign the act." };

  const preview = previewAct(act, ctx);
  const signedAct: LegalAct = {
    ...act,
    status: "In force",
    registeredBy: official.trim(),
    registeredAt: timestamp,
  };
  const audit: AuditEntry[] = [
    createAuditEntry({
      caseId: act.id,
      actor: official.trim(),
      action: "Legal act registered as in force",
      from: "Draft",
      to: "In force",
      reason: `${act.number} signed once; applied to ${preview.affectedFines.length} fines.`,
      timestamp,
    }),
  ];
  const statusBefore = new Map(
    preview.affectedFines.map((fine) => [fine.id, deriveFineStatus(fine, ctx)]),
  );
  for (const fine of preview.affectedFines) {
    audit.push(
      createAuditEntry({
        caseId: fine.id,
        actor: "System",
        action: "Fine revoked by legal act",
        from: statusBefore.get(fine.id) ?? "",
        to: "Revoked",
        reason: `R10: camera ${fine.cameraId} non-compliant and ${act.number} in force.`,
        timestamp,
      }),
    );
  }

  const released = new Map<string, RefundCase>();
  for (const refund of preview.refundsToRelease) {
    const result = changeStatus(
      refund,
      "Eligible",
      "System",
      "R11: paid and revoked by a legal act in force.",
      {
        timestamp,
        messageValues: { fine_id: refund.fineId, amount: formatCOP(refund.amount) },
      },
    );
    if (!result.ok) return result;
    released.set(refund.id, result.entity);
    audit.push(result.audit);
  }
  const refunds = ctx.refunds.map((refund) => released.get(refund.id) ?? refund);
  return { ok: true, act: signedAct, refunds, audit, preview };
}

/** Every SDM fine the act covers (non-compliant camera on the infraction date), revoked or not. */
export function finesCoveredByAct(act: LegalAct, ctx: RulesContext): Fine[] {
  return ctx.fines.filter(
    (fine) =>
      act.cameraIds.includes(fine.cameraId) &&
      !isOtherAuthority(fine) &&
      isFineOnNonCompliantCamera(fine, ctx),
  );
}

export function totalAmount(fines: readonly Fine[]): number {
  return fines.reduce((sum, fine) => sum + fine.amount, 0);
}

/** The exact notification each citizen receives when the act is applied to their fine. */
export function revocationNotice(fine: Fine, act: LegalAct): string {
  return fillTemplate(fine.paidOn ? REVOCATION_NOTICES.paid : REVOCATION_NOTICES.unpaid, {
    fine_id: fine.id,
    amount: formatCOP(fine.amount),
    act_number: act.number,
    camera: fine.cameraId,
    date: formatDate(fine.infractionDate),
  });
}
