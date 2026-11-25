import type { IsoTimestamp } from "./entities";
import type { RuleId, RuleLevel } from "./status";

export type FindingCategory =
  "Dates" | "Documents" | "Registry" | "Similarity" | "Fraud" | "Summary";
export type FindingResult = "Pass" | "Flag" | "Info";
export type Confidence = "High" | "Medium" | "Low";
export type ReviewStatus = "Pending" | "Confirmed" | "Dismissed";

/** One check the (mock, deterministic) AI analysis ran on a case or refund. */
export interface AnalysisFinding {
  id: string;
  caseId: string;
  category: FindingCategory;
  check: string;
  result: FindingResult;
  /** Where the evidence comes from, e.g. "From: Driver statement, p.1". */
  evidence: string;
  confidence: Confidence;
  level: RuleLevel;
  ruleId?: RuleId;
  /** Plain-language explanation shown under "Why?". */
  why: string;
  reviewStatus: ReviewStatus;
  reviewReason?: string;
  reviewedBy?: string;
}

/** An inspector's review of a flag, stored separately and merged into findings. */
export interface FindingReview {
  status: Exclude<ReviewStatus, "Pending">;
  reason?: string;
  reviewedBy: string;
  timestamp: IsoTimestamp;
}

export interface CaseAnalysis {
  caseId: string;
  findings: AnalysisFinding[];
  summary: string;
}
