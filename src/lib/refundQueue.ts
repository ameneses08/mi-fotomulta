import { formatCOP } from "@/lib/format";
import { evaluateRefundRules, RULES_CONFIG, type RulesContext } from "@/lib/rules";
import type { RefundCase, RefundStatus, RuleCheck } from "@/types";

export type RefundSection = "autoApproved" | "held" | "fraud" | "waiting";

export interface RefundQueueItem {
  refund: RefundCase;
  section: RefundSection;
  checks: RuleCheck[];
  /** Fraud signals. A flag never rejects a refund; a person resolves it. */
  fraudFlags: string[];
  /** Why the refund needs a person (threshold, failed checks). */
  holdReasons: string[];
}

/** Accounts receiving this many refunds from different claimants are flagged. */
export const SHARED_ACCOUNT_LIMIT = 3;

const CLOSED: RefundStatus[] = ["Paid", "Rejected"];
const DECIDED: RefundStatus[] = ["Approved", "Paid"];
const IN_REVIEW: RefundStatus[] = ["Verifying payment details", "Needs correction"];

const accountKey = (r: RefundCase) =>
  r.bankAccount ? `${r.bankAccount.bank}|${r.bankAccount.last4}` : "";

export function fraudFlagsFor(refund: RefundCase, all: readonly RefundCase[]): string[] {
  const flags: string[] = [];
  const account = refund.bankAccount;
  if (account && account.holderDocument !== refund.claimantDocument) {
    flags.push(`Account holder (${account.holderName}) doesn't match the claimant`);
  }
  // Only the later claim is the duplicate; the first one on a fine is legitimate.
  const earlier = all.filter(
    (r) =>
      r.id !== refund.id &&
      r.fineId === refund.fineId &&
      r.status !== "Rejected" &&
      r.requestedOn < refund.requestedOn,
  );
  if (earlier.length) {
    flags.push(
      `Duplicate claim on fine ${refund.fineId} (already claimed in ${earlier.map((r) => r.id).join(", ")})`,
    );
  }
  const key = accountKey(refund);
  const sharing = key ? all.filter((r) => accountKey(r) === key) : [];
  const claimants = new Set(sharing.map((r) => r.claimantDocument));
  if (claimants.size >= SHARED_ACCOUNT_LIMIT) {
    flags.push(
      `Account ending ${account?.last4} receives ${sharing.length} refunds from different claimants`,
    );
  }
  return flags;
}

function holdReasonsFor(refund: RefundCase, checks: RuleCheck[]): string[] {
  const reasons: string[] = [];
  if (refund.amount > RULES_CONFIG.refundHumanThreshold) {
    reasons.push(`Above the ${formatCOP(RULES_CONFIG.refundHumanThreshold)} threshold`);
  }
  for (const check of checks) {
    if (check.result !== "Pass") reasons.push(`${check.ruleId}: ${check.detail}`);
  }
  return reasons;
}

function sectionFor(refund: RefundCase, flags: string[]): RefundSection {
  if (flags.length && !CLOSED.includes(refund.status)) return "fraud";
  if (
    DECIDED.includes(refund.status) &&
    refund.amount <= RULES_CONFIG.refundHumanThreshold &&
    !flags.length
  ) {
    return "autoApproved";
  }
  return IN_REVIEW.includes(refund.status) ? "held" : "waiting";
}

export function buildRefundQueue(ctx: RulesContext): Record<RefundSection, RefundQueueItem[]> {
  const queue: Record<RefundSection, RefundQueueItem[]> = {
    autoApproved: [],
    held: [],
    fraud: [],
    waiting: [],
  };
  for (const refund of ctx.refunds) {
    const checks = evaluateRefundRules(refund, ctx);
    const fraudFlags = fraudFlagsFor(refund, ctx.refunds);
    const holdReasons = holdReasonsFor(refund, checks);
    const section = sectionFor(refund, fraudFlags);
    queue[section].push({ refund, section, checks, fraudFlags, holdReasons });
  }
  return queue;
}
