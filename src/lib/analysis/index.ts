import { analysisScripts as T } from "@/data/aiScripts";
import { caseBriefFor } from "@/lib/brief";
import { fillTemplate } from "@/lib/format";
import { findFine } from "@/lib/rules";
import type { AnalysisFinding, CaseAnalysis, FindingCategory, RuleId } from "@/types";
import { dateFindings } from "./dates";
import { documentFindings } from "./documents";
import { isOpenFlag, type AnalysisContext } from "./finding";
import { fraudFindings, refundFraudFindings } from "./fraud";
import { refundRegistryFindings, registryFindings } from "./registry";
import { similarityFindings } from "./similarity";

export type { AnalysisContext } from "./finding";
export { isOpenFlag } from "./finding";

export const CATEGORY_ORDER: FindingCategory[] = [
  "Summary",
  "Dates",
  "Documents",
  "Registry",
  "Similarity",
  "Fraud",
];

function summarise(findings: AnalysisFinding[], template: string, brief = ""): string {
  return fillTemplate(template, {
    passed: String(findings.filter((f) => f.result === "Pass").length),
    total: String(findings.length),
    flags: String(findings.filter(isOpenFlag).length),
    brief,
  }).trim();
}

/** Single entry point for a challenge: every check, deterministic, with a short summary. */
export function analyseCase(caseId: string, ctx: AnalysisContext): CaseAnalysis | undefined {
  const challenge = ctx.challenges.find((c) => c.id === caseId);
  const fine = challenge && findFine(ctx, challenge.fineId);
  if (!challenge || !fine) return undefined;
  const findings = [
    ...dateFindings(challenge, fine, ctx),
    ...documentFindings(challenge, fine, ctx),
    ...registryFindings(challenge, fine, ctx),
    ...similarityFindings(challenge, ctx),
    ...fraudFindings(challenge, ctx),
  ];
  return {
    caseId,
    findings,
    summary: summarise(findings, T.summary, caseBriefFor(challenge).brief),
  };
}

/** Single entry point for a refund. */
export function analyseRefund(refundId: string, ctx: AnalysisContext): CaseAnalysis | undefined {
  const refund = ctx.refunds.find((r) => r.id === refundId);
  const fine = refund && findFine(ctx, refund.fineId);
  if (!refund || !fine) return undefined;
  const findings = [
    ...refundRegistryFindings(refund, fine, ctx),
    ...refundFraudFindings(refund, ctx),
  ];
  return { caseId: refundId, findings, summary: summarise(findings, T.refundSummary) };
}

/** Open flags, shown as chips in the inbox (rule id, or category when there is none). */
export function flagLabels(analysis: CaseAnalysis | undefined): (RuleId | FindingCategory)[] {
  return [
    ...new Set((analysis?.findings ?? []).filter(isOpenFlag).map((f) => f.ruleId ?? f.category)),
  ];
}
