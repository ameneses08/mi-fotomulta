import { formatCOP, formatDate, lastFour } from "@/lib/format";
import { evaluateRefundRules } from "@/lib/rules";
import type { RulesContext } from "@/lib/rules";
import { addWorkingDays, SLA_CONFIG } from "@/lib/sla";
import { changeStatus } from "@/lib/transitions";
import type {
  AuditEntry,
  BankAccount,
  Citizen,
  IsoDate,
  IsoTimestamp,
  RefundCase,
  RefundDecisionKind,
  RefundStatus,
} from "@/types";

export interface BankForm {
  bank: string;
  type: BankAccount["type"];
  account: string;
  consent: boolean;
}

export const EMPTY_BANK_FORM: BankForm = { bank: "", type: "Savings", account: "", consent: false };

export const CONSENT_PURPOSE = "The SDM uses this account only to pay this refund.";

export function validateBankForm(form: BankForm): string | null {
  if (!form.bank.trim() || !/^\d{6,20}$/.test(form.account)) {
    return "Choose a bank and enter an account number with 6–20 digits.";
  }
  if (!form.consent) return "Your separate consent is required to use these payment details.";
  return null;
}

type RefundResult =
  { ok: true; refund: RefundCase; audit: AuditEntry[] } | { ok: false; error: string };

/**
 * Saves the account in the citizen's name with separate consent. An Eligible refund moves on
 * to verification; a refund on hold only keeps the details for later.
 */
export function submitBankDetails(
  refund: RefundCase,
  form: BankForm,
  citizen: Citizen,
  timestamp: IsoTimestamp,
): RefundResult {
  const error = validateBankForm(form);
  if (error) return { ok: false, error };
  const withDetails: RefundCase = {
    ...refund,
    bankAccount: {
      bank: form.bank,
      type: form.type,
      last4: lastFour(form.account),
      holderName: citizen.name,
      holderDocument: citizen.document,
    },
    consent: { purpose: CONSENT_PURPOSE, givenOn: timestamp },
  };
  if (refund.status !== "Eligible" && refund.status !== "Needs correction") {
    return { ok: true, refund: withDetails, audit: [] };
  }
  const result = changeStatus(
    withDetails,
    "Verifying payment details",
    citizen.name,
    "Bank account submitted",
    {
      timestamp,
    },
  );
  return result.ok ? { ok: true, refund: result.entity, audit: [result.audit] } : result;
}

export function decideRefund(
  refund: RefundCase,
  kind: RefundDecisionKind,
  actor: string,
  reason: string,
  today: IsoDate,
  timestamp: IsoTimestamp,
): RefundResult {
  const appealBy = formatDate(addWorkingDays(today, SLA_CONFIG.appealDays));
  const targets: Record<RefundDecisionKind, [RefundStatus, Record<string, string>]> = {
    Approve: [
      "Approved",
      {
        amount: formatCOP(refund.amount),
        date: formatDate(addWorkingDays(today, SLA_CONFIG.refundPaymentDays)),
      },
    ],
    "Request correction": ["Needs correction", { reason: reason.trim() }],
    Reject: ["Rejected", { reason: reason.trim(), date: appealBy }],
  };
  const [status, messageValues] = targets[kind];
  const result = changeStatus(refund, status, actor, reason, { timestamp, messageValues });
  return result.ok ? { ok: true, refund: result.entity, audit: [result.audit] } : result;
}

/** R12 automated path: approve when every refund rule passes at level A; otherwise leave for a human. */
export function autoVerifyRefund(
  refund: RefundCase,
  ctx: RulesContext,
  today: IsoDate,
  timestamp: IsoTimestamp,
): RefundResult | null {
  if (refund.status !== "Verifying payment details") return null;
  const checks = evaluateRefundRules(refund, ctx);
  const automatic = checks.every((c) => c.result === "Pass" && c.level === "A");
  if (!automatic) return null;
  return decideRefund(
    refund,
    "Approve",
    "System",
    "R11 and R12 passed automatically",
    today,
    timestamp,
  );
}

const OPEN_REFUND = new Set<RefundStatus>([
  "On hold",
  "Eligible",
  "Verifying payment details",
  "Needs correction",
  "Approved",
]);

/** "Money to recover" on the citizen home: open refunds that have not been paid or rejected. */
export function recoverableAmount(refunds: readonly RefundCase[], citizenDocument: string): number {
  return refunds
    .filter((r) => r.claimantDocument === citizenDocument && OPEN_REFUND.has(r.status))
    .reduce((sum, r) => sum + r.amount, 0);
}
