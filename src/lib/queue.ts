import {
  analyseCase,
  analyseRefund,
  flagLabels,
  isOpenFlag,
  type AnalysisContext,
} from "@/lib/analysis";
import { challengeClock, type LegalClock } from "@/lib/sla";
import type {
  AnalysisFinding,
  CaseAnalysis,
  ChallengeCase,
  ChallengeReason,
  ChallengeStatus,
  FindingCategory,
  RuleId,
} from "@/types";

export type Priority = "High" | "Medium" | "Low";

export interface ChallengeRow {
  challenge: ChallengeCase;
  clock: LegalClock;
  analysis: CaseAnalysis | undefined;
  flags: (RuleId | FindingCategory)[];
  priority: Priority;
  open: boolean;
  groupId?: string;
}

export interface CaseGroup {
  id: string;
  representative: string;
  cases: ChallengeCase[];
}

export interface InboxFilters {
  priority: Priority | "All";
  type: ChallengeReason | "All";
  assignee: "All" | "Mine";
}

export const ALL_FILTERS: InboxFilters = { priority: "All", type: "All", assignee: "All" };

const OPEN_STATUSES = new Set<ChallengeStatus>([
  "Received",
  "Validating",
  "Needs correction",
  "Hearing scheduled",
]);
const PRIORITY_ORDER: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export function isOpenChallenge(challenge: ChallengeCase): boolean {
  return OPEN_STATUSES.has(challenge.status);
}

/** "LegalRápido S.A.S." → "legalrapido-s-a-s" */
export function groupIdFor(representative: string): string {
  return representative
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * High: deadline at risk, or a high-confidence open flag on dates or fraud.
 * Medium: any other open flag. Low: nothing for an inspector to check first.
 */
export function priorityOf(clock: LegalClock, findings: readonly AnalysisFinding[]): Priority {
  const open = findings.filter(isOpenFlag);
  const urgent = open.some(
    (f) => f.confidence === "High" && (f.category === "Dates" || f.category === "Fraud"),
  );
  if (clock.risk !== "On track" || urgent) return "High";
  return open.length ? "Medium" : "Low";
}

/** Cases filed by the same representative, open ones only, two or more per group. */
export function buildGroups(challenges: readonly ChallengeCase[]): CaseGroup[] {
  const groups = new Map<string, CaseGroup>();
  for (const challenge of challenges) {
    const rep = challenge.representative;
    if (!rep || !isOpenChallenge(challenge)) continue;
    const id = groupIdFor(rep);
    const group = groups.get(id) ?? { id, representative: rep, cases: [] };
    groups.set(id, { ...group, cases: [...group.cases, challenge] });
  }
  return [...groups.values()].filter((g) => g.cases.length > 1);
}

/** Challenges triaged by priority, then deadline risk. Decided cases go last. */
export function buildChallengeRows(ctx: AnalysisContext): ChallengeRow[] {
  const grouped = new Set(buildGroups(ctx.challenges).map((g) => g.id));
  return ctx.challenges
    .map((challenge): ChallengeRow => {
      const clock = challengeClock(challenge, ctx.today);
      const analysis = analyseCase(challenge.id, ctx);
      const groupId = challenge.representative ? groupIdFor(challenge.representative) : undefined;
      return {
        challenge,
        clock,
        analysis,
        flags: flagLabels(analysis),
        priority: priorityOf(clock, analysis?.findings ?? []),
        open: isOpenChallenge(challenge),
        ...(groupId && grouped.has(groupId) ? { groupId } : {}),
      };
    })
    .sort(
      (a, b) =>
        Number(b.open) - Number(a.open) ||
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        b.clock.used - a.clock.used,
    );
}

export function filterRows(
  rows: ChallengeRow[],
  filters: InboxFilters,
  me: string,
): ChallengeRow[] {
  return rows.filter(
    (row) =>
      (filters.priority === "All" || row.priority === filters.priority) &&
      (filters.type === "All" || row.challenge.reason === filters.type) &&
      (filters.assignee === "All" || row.challenge.holder.endsWith(me)),
  );
}

export interface QueueSummary {
  openCases: number;
  atRisk: number;
  refundsToApprove: number;
  flagged: number;
}

export function summariseQueue(rows: ChallengeRow[], ctx: AnalysisContext): QueueSummary {
  const open = rows.filter((r) => r.open);
  const pendingRefunds = ctx.refunds.filter((r) => r.status === "Verifying payment details");
  return {
    openCases: open.length,
    atRisk: open.filter((r) => r.clock.risk !== "On track").length,
    refundsToApprove: pendingRefunds.length,
    flagged:
      open.filter((r) => r.flags.length > 0).length +
      pendingRefunds.filter((r) => analyseRefund(r.id, ctx)?.findings.some(isOpenFlag)).length,
  };
}
