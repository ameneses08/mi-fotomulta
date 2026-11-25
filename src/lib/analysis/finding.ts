import type { RulesContext } from "@/lib/rules";
import type {
  AnalysisFinding,
  ChallengeCase,
  EvidenceItem,
  EvidenceKind,
  ExtractedFieldName,
  FindingReview,
  IsoDate,
} from "@/types";

export interface AnalysisContext extends RulesContext {
  /** Inspector reviews of flags, keyed by finding id. */
  reviews: Readonly<Record<string, FindingReview>>;
  today: IsoDate;
}

type FindingInput = Omit<AnalysisFinding, "id" | "reviewStatus" | "reviewReason" | "reviewedBy">;

/** Builds a finding with a stable id and merges any inspector review of it. */
export function makeFinding(
  key: string,
  input: FindingInput,
  ctx: AnalysisContext,
): AnalysisFinding {
  const id = `${input.caseId}:${key}`;
  const review = ctx.reviews[id];
  return {
    id,
    ...input,
    reviewStatus: review?.status ?? "Pending",
    ...(review?.reason ? { reviewReason: review.reason } : {}),
    ...(review ? { reviewedBy: review.reviewedBy } : {}),
  };
}

export function documentOf(challenge: ChallengeCase, kind: EvidenceKind): EvidenceItem | undefined {
  return challenge.evidence.find((item) => item.kind === kind);
}

export function fieldOf(doc: EvidenceItem | undefined, name: ExtractedFieldName) {
  return doc?.extracted?.find((field) => field.name === name);
}

/** "From: Driver statement, p.1" */
export function evidenceFrom(doc: EvidenceItem, name?: ExtractedFieldName): string {
  const page = name ? fieldOf(doc, name)?.page : undefined;
  return `From: ${doc.kind}${page ? `, p.${page}` : ""}`;
}

/** A pending flag is one the inspector has not dismissed as a false positive. */
export function isOpenFlag(finding: AnalysisFinding): boolean {
  return finding.result === "Flag" && finding.reviewStatus !== "Dismissed";
}
