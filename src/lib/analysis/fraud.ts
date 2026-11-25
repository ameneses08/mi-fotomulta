import { analysisScripts as T } from "@/data/aiScripts";
import { fillTemplate, formatDate, formatTimestamp } from "@/lib/format";
import type { AnalysisFinding, ChallengeCase, RefundCase } from "@/types";
import { documentOf, evidenceFrom, fieldOf, makeFinding, type AnalysisContext } from "./finding";

/** Accounts receiving this many refunds from different claimants are flagged. */
export const SHARED_ACCOUNT_LIMIT = 3;

function duplicateFinding(challenge: ChallengeCase, ctx: AnalysisContext): AnalysisFinding {
  const others = ctx.challenges.filter(
    (c) => c.fineId === challenge.fineId && c.id !== challenge.id,
  );
  return makeFinding(
    "R3",
    {
      caseId: challenge.id,
      category: "Fraud",
      check: T.checks.duplicate,
      result: others.length ? "Flag" : "Pass",
      evidence: "From: case register",
      confidence: "High",
      level: "A",
      ruleId: "R3",
      why: fillTemplate(others.length ? T.why.duplicateFlag : T.why.duplicatePass, {
        fine: challenge.fineId,
        others: others.map((c) => c.id).join(", "),
      }),
    },
    ctx,
  );
}

function imageFindings(challenge: ChallengeCase, ctx: AnalysisContext): AnalysisFinding[] {
  return challenge.evidence
    .filter((item) => item.kind === "Photo" && item.metadata)
    .map((photo, index) => {
      const meta = photo.metadata;
      const edited = Boolean(
        meta?.software || (meta?.modifiedAt && meta.modifiedAt > meta.capturedAt),
      );
      return makeFinding(
        `image-${index}`,
        {
          caseId: challenge.id,
          category: "Fraud",
          check: T.checks.imageMetadata,
          result: edited ? "Flag" : "Pass",
          evidence: `From: ${photo.name} (file metadata)`,
          confidence: "Medium",
          level: "S",
          why: fillTemplate(edited ? T.why.imageFlag : T.why.imagePass, {
            software: meta?.software ?? "an editor",
            modified: meta?.modifiedAt ? formatTimestamp(meta.modifiedAt) : "",
            captured: meta ? formatTimestamp(meta.capturedAt) : "",
          }),
        },
        ctx,
      );
    });
}

function powerOfAttorneyFinding(
  challenge: ChallengeCase,
  ctx: AnalysisContext,
): AnalysisFinding | undefined {
  const poa = documentOf(challenge, "Power of attorney");
  const expires = fieldOf(poa, "Expires")?.value;
  if (!poa || !expires) return undefined;
  const valid = expires >= challenge.submittedOn;
  return makeFinding(
    "poa",
    {
      caseId: challenge.id,
      category: "Fraud",
      check: T.checks.powerOfAttorney,
      result: valid ? "Pass" : "Flag",
      evidence: evidenceFrom(poa, "Expires"),
      confidence: "High",
      level: valid ? "A" : "H",
      why: fillTemplate(valid ? T.why.poaPass : T.why.poaFlag, {
        person: fieldOf(poa, "Represented person")?.value ?? challenge.citizenName,
        expires: formatDate(expires),
      }),
    },
    ctx,
  );
}

/** Duplicates (R3), photo metadata and power-of-attorney validity for a challenge. */
export function fraudFindings(challenge: ChallengeCase, ctx: AnalysisContext): AnalysisFinding[] {
  const findings = [
    duplicateFinding(challenge, ctx),
    ...imageFindings(challenge, ctx),
    powerOfAttorneyFinding(challenge, ctx),
  ];
  return findings.filter((f): f is AnalysisFinding => Boolean(f));
}

const accountKey = (r: RefundCase) =>
  r.bankAccount ? `${r.bankAccount.bank}|${r.bankAccount.last4}` : "";

/** Holder mismatch (R12), a later duplicate claim and one account paying several claimants. */
export function refundFraudFindings(refund: RefundCase, ctx: AnalysisContext): AnalysisFinding[] {
  const account = refund.bankAccount;
  // Only the later claim is the duplicate; the first one on a fine is legitimate.
  const earlier = ctx.refunds.filter(
    (r) =>
      r.id !== refund.id &&
      r.fineId === refund.fineId &&
      r.status !== "Rejected" &&
      r.requestedOn < refund.requestedOn,
  );
  const key = accountKey(refund);
  const sharing = key ? ctx.refunds.filter((r) => accountKey(r) === key) : [];
  const reused = new Set(sharing.map((r) => r.claimantDocument)).size >= SHARED_ACCOUNT_LIMIT;
  const holderOk = Boolean(account && account.holderDocument === refund.claimantDocument);
  const base = { caseId: refund.id, category: "Fraud" as const, confidence: "High" as const };
  return [
    makeFinding(
      "holder",
      {
        ...base,
        check: T.checks.holder,
        result: holderOk ? "Pass" : "Flag",
        evidence: "From: bank account details and claimant ID",
        level: holderOk ? "A" : "H",
        ruleId: "R12",
        why: !account
          ? T.why.holderMissing
          : fillTemplate(holderOk ? T.why.holderPass : T.why.holderFlag, {
              last4: account.last4,
              holder: account.holderName,
            }),
      },
      ctx,
    ),
    makeFinding(
      "duplicate-claim",
      {
        ...base,
        check: T.checks.duplicateClaim,
        result: earlier.length ? "Flag" : "Pass",
        evidence: "From: refund register",
        level: earlier.length ? "H" : "A",
        ruleId: "R3",
        why: fillTemplate(earlier.length ? T.why.duplicateClaimFlag : T.why.duplicateClaimPass, {
          fine: refund.fineId,
          others: earlier.map((r) => r.id).join(", "),
        }),
      },
      ctx,
    ),
    makeFinding(
      "account-reuse",
      {
        ...base,
        check: T.checks.accountReuse,
        result: reused ? "Flag" : "Pass",
        evidence: "From: bank accounts across refunds",
        level: reused ? "H" : "A",
        why: reused
          ? fillTemplate(T.why.accountReuseFlag, {
              last4: account?.last4 ?? "",
              count: String(sharing.length),
            })
          : T.why.accountReusePass,
      },
      ctx,
    ),
  ];
}
