import { analyseRefund, isOpenFlag, type AnalysisContext } from "@/lib/analysis";
import { RULES_CONFIG } from "@/lib/rules";
import type { AnalysisFinding, CaseAnalysis, RefundCase, RefundStatus } from "@/types";

export type RefundSection = "autoApproved" | "held" | "fraud" | "waiting";

export interface RefundQueueItem {
  refund: RefundCase;
  section: RefundSection;
  analysis: CaseAnalysis | undefined;
  /** Open fraud flags. A flag never rejects a refund; a person resolves it. */
  fraudFlags: AnalysisFinding[];
  /** Other open flags that need a person (threshold, eligibility). */
  holdReasons: AnalysisFinding[];
}

const CLOSED: RefundStatus[] = ["Paid", "Rejected"];
const DECIDED: RefundStatus[] = ["Approved", "Paid"];
const IN_REVIEW: RefundStatus[] = ["Verifying payment details", "Needs correction"];

function sectionFor(refund: RefundCase, fraudFlags: AnalysisFinding[]): RefundSection {
  if (fraudFlags.length && !CLOSED.includes(refund.status)) return "fraud";
  if (
    DECIDED.includes(refund.status) &&
    refund.amount <= RULES_CONFIG.refundHumanThreshold &&
    !fraudFlags.length
  ) {
    return "autoApproved";
  }
  return IN_REVIEW.includes(refund.status) ? "held" : "waiting";
}

export function buildRefundQueue(ctx: AnalysisContext): Record<RefundSection, RefundQueueItem[]> {
  const queue: Record<RefundSection, RefundQueueItem[]> = {
    autoApproved: [],
    held: [],
    fraud: [],
    waiting: [],
  };
  for (const refund of ctx.refunds) {
    const analysis = analyseRefund(refund.id, ctx);
    const open = (analysis?.findings ?? []).filter(isOpenFlag);
    const fraudFlags = open.filter((f) => f.category === "Fraud");
    const holdReasons = open.filter((f) => f.category !== "Fraud");
    const section = sectionFor(refund, fraudFlags);
    queue[section].push({ refund, section, analysis, fraudFlags, holdReasons });
  }
  return queue;
}
