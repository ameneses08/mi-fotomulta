import { REVIEW_ACTIONS } from "@/lib/analysis/review";
import type { AuditEntry } from "@/types";

/** Assumption (CLAUDE.md): an AI summary saves an inspector about 4 minutes of reading. */
export const OVERSIGHT_CONFIG = { minutesPerSummary: 4 } as const;

export interface OversightReason {
  caseId: string;
  reason: string;
}

export interface OversightStats {
  accepted: number;
  overridden: number;
  notFollowed: number;
  overrideReasons: OversightReason[];
  confirmed: number;
  dismissed: number;
  /** Dismissed ÷ reviewed flags, or null when no flag has been reviewed. */
  falsePositiveRate: number | null;
  dismissReasons: OversightReason[];
  minutesSaved: number;
  aiActions: number;
}

const count = (audit: readonly AuditEntry[], action: string) =>
  audit.filter((e) => e.action === action).length;

/** Everything is computed from the (read-only) audit log, plus the number of summarised filings. */
export function computeOversight(
  audit: readonly AuditEntry[],
  summarisedFilings: number,
): OversightStats {
  const overriddenEntries = audit.filter((e) => e.action === "AI suggestion overridden");
  const overrideReasons = overriddenEntries.map((entry) => {
    const decision = audit.find(
      (e) =>
        e.caseId === entry.caseId &&
        e.timestamp === entry.timestamp &&
        e.action === "Status changed",
    );
    return { caseId: entry.caseId, reason: decision?.reason ?? entry.reason };
  });
  const confirmed = count(audit, REVIEW_ACTIONS.Confirmed);
  const dismissed = count(audit, REVIEW_ACTIONS.Dismissed);
  return {
    accepted: count(audit, "AI suggestion accepted"),
    overridden: overriddenEntries.length,
    notFollowed: count(audit, "AI suggestion not followed"),
    overrideReasons,
    confirmed,
    dismissed,
    falsePositiveRate: confirmed + dismissed ? dismissed / (confirmed + dismissed) : null,
    dismissReasons: audit
      .filter((e) => e.action === REVIEW_ACTIONS.Dismissed)
      .map((e) => ({ caseId: e.caseId, reason: e.reason })),
    minutesSaved: summarisedFilings * OVERSIGHT_CONFIG.minutesPerSummary,
    aiActions: audit.filter((e) => e.actor === "AI assistant").length,
  };
}
