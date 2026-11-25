import { recoverableAmount } from "@/lib/refund";
import { deriveFineStatus, type RulesContext } from "@/lib/rules";
import type { Fine, FineStatus } from "@/types";

export interface CitizenSummary {
  total: number;
  toPay: { count: number; amount: number };
  inProgress: number;
  moneyToRecover: number;
  byStatus: Partial<Record<FineStatus, Fine[]>>;
}

const IN_PROGRESS = new Set<FineStatus>(["Challenge in progress", "Under review"]);

export function citizenFines(ctx: RulesContext, document: string): Fine[] {
  return ctx.fines.filter((fine) => fine.ownerDocument === document);
}

/** Figures for the three dashboard cards and the assistant's status check. */
export function summariseCitizen(ctx: RulesContext, document: string): CitizenSummary {
  const fines = citizenFines(ctx, document);
  const byStatus: Partial<Record<FineStatus, Fine[]>> = {};
  for (const fine of fines) {
    const status = deriveFineStatus(fine, ctx);
    byStatus[status] = [...(byStatus[status] ?? []), fine];
  }
  const unpaid = byStatus["Pending payment"] ?? [];
  return {
    total: fines.length,
    toPay: { count: unpaid.length, amount: unpaid.reduce((sum, f) => sum + f.amount, 0) },
    inProgress: fines.filter((f) => IN_PROGRESS.has(deriveFineStatus(f, ctx))).length,
    moneyToRecover: recoverableAmount(ctx.refunds, document),
    byStatus,
  };
}
