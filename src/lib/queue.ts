import {
  evaluateChallengeRules,
  evaluateRefundRules,
  flaggedRules,
  type RulesContext,
} from "@/lib/rules";
import { challengeClock, type LegalClock } from "@/lib/sla";
import type {
  ChallengeCase,
  ChallengeStatus,
  ClockRisk,
  IsoDate,
  RefundCase,
  RuleId,
} from "@/types";

export interface ChallengeRow {
  challenge: ChallengeCase;
  clock: LegalClock;
  flags: RuleId[];
  open: boolean;
}

export interface RefundRow {
  refund: RefundCase;
  flags: RuleId[];
}

export interface RowGroup {
  representative: string;
  rows: ChallengeRow[];
}

export type QueueItem = { type: "row"; row: ChallengeRow } | { type: "group"; group: RowGroup };

const OPEN_STATUSES = new Set<ChallengeStatus>([
  "Received",
  "Validating",
  "Needs correction",
  "Hearing scheduled",
]);
const RISK_ORDER: Record<ClockRisk, number> = { Overdue: 0, "At risk": 1, "On track": 2 };

/** Challenges sorted by deadline risk: open before decided, then overdue, at risk, on track. */
export function buildChallengeRows(ctx: RulesContext, today: IsoDate): ChallengeRow[] {
  return ctx.challenges
    .map((challenge) => ({
      challenge,
      clock: challengeClock(challenge, today),
      flags: flaggedRules(evaluateChallengeRules(challenge, ctx)),
      open: OPEN_STATUSES.has(challenge.status),
    }))
    .sort(
      (a, b) =>
        Number(b.open) - Number(a.open) ||
        RISK_ORDER[a.clock.risk] - RISK_ORDER[b.clock.risk] ||
        b.clock.used - a.clock.used,
    );
}

export function buildRefundRows(ctx: RulesContext): RefundRow[] {
  return ctx.refunds.map((refund) => ({
    refund,
    flags: flaggedRules(evaluateRefundRules(refund, ctx)),
  }));
}

/**
 * Collapses open cases filed by the same representative into one overview group, placed where
 * its first member would be. Grouping never changes how each case is decided.
 */
export function groupSimilar(rows: ChallengeRow[]): QueueItem[] {
  const byRep = new Map<string, ChallengeRow[]>();
  for (const row of rows) {
    const rep = row.challenge.representative;
    if (rep && row.open) byRep.set(rep, [...(byRep.get(rep) ?? []), row]);
  }
  const items: QueueItem[] = [];
  const placed = new Set<string>();
  for (const row of rows) {
    const rep = row.challenge.representative;
    const group = rep ? byRep.get(rep) : undefined;
    if (!rep || !group || group.length < 2 || !row.open) {
      items.push({ type: "row", row });
    } else if (!placed.has(rep)) {
      placed.add(rep);
      items.push({ type: "group", group: { representative: rep, rows: group } });
    }
  }
  return items;
}

export interface QueueSummary {
  openCases: number;
  atRisk: number;
  refundsToApprove: number;
  flagged: number;
}

export function summariseQueue(
  challengeRows: ChallengeRow[],
  refundRows: RefundRow[],
): QueueSummary {
  const open = challengeRows.filter((r) => r.open);
  return {
    openCases: open.length,
    atRisk: open.filter((r) => r.clock.risk !== "On track").length,
    refundsToApprove: refundRows.filter((r) => r.refund.status === "Verifying payment details")
      .length,
    flagged:
      open.filter((r) => r.flags.length > 0).length +
      refundRows.filter((r) => r.flags.length > 0).length,
  };
}
