import { MOCK_BANK_ACCOUNT } from "@/data/mockData";
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

export type BankField = "bank" | "account" | "consent";
export type BankFormErrors = Partial<Record<BankField, string>>;

/** Prefilled fictional account so the recording only needs the consent tick. */
export const DEMO_BANK_FORM: BankForm = { ...MOCK_BANK_ACCOUNT, consent: false };

export const CONSENT_PURPOSE = "The SDM uses this account only to pay this refund.";

export const BANK_ERRORS: Record<BankField, string> = {
  bank: "Choose a bank.",
  account: "Enter an account number with 6–20 digits.",
  consent: "Your separate consent is required to use these payment details.",
};

/** People type account numbers with spaces, dashes or dots; only the digits count. */
export function normaliseAccount(value: string): string {
  return value.replace(/[\s.-]/g, "");
}

/** One message per wrong field. An empty object means the form is valid. */
export function validateBankFields(form: BankForm): BankFormErrors {
  const errors: BankFormErrors = {};
  if (!form.bank.trim()) errors.bank = BANK_ERRORS.bank;
  if (!/^\d{6,20}$/.test(normaliseAccount(form.account))) errors.account = BANK_ERRORS.account;
  if (!form.consent) errors.consent = BANK_ERRORS.consent;
  return errors;
}

/**
 * Reads the values actually shown in the form at submit time. Browser autofill and form restore
 * can fill fields without change events, so the submitted fields are the source of truth.
 */
export function bankFormFromData(data: FormData): BankForm {
  const text = (name: string) => {
    const value = data.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    bank: text("bank"),
    type: text("type") === "Checking" ? "Checking" : "Savings",
    account: text("account"),
    consent: data.get("consent") !== null,
  };
}

type RefundResult =
  { ok: true; refund: RefundCase; audit: AuditEntry[] } | { ok: false; error: string };

type SubmitResult =
  { ok: true; refund: RefundCase; audit: AuditEntry[] } | { ok: false; errors: BankFormErrors };

/**
 * Saves the account in the citizen's name with separate consent. An Eligible refund moves on
 * to verification; a refund on hold only keeps the details for later.
 */
export function submitBankDetails(
  refund: RefundCase,
  form: BankForm,
  citizen: Citizen,
  timestamp: IsoTimestamp,
): SubmitResult {
  const errors = validateBankFields(form);
  if (Object.keys(errors).length) return { ok: false, errors };
  const withDetails: RefundCase = {
    ...refund,
    bankAccount: {
      bank: form.bank,
      type: form.type,
      last4: lastFour(normaliseAccount(form.account)),
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
  return result.ok
    ? { ok: true, refund: result.entity, audit: [result.audit] }
    : { ok: false, errors: { account: result.error } };
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
