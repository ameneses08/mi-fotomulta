import { analysisScripts as T } from "@/data/aiScripts";
import { fillTemplate, formatCOP, formatDate } from "@/lib/format";
import {
  actRevokingFine,
  deriveRefundEligibility,
  isFineOnNonCompliantCamera,
  RULES_CONFIG,
} from "@/lib/rules";
import type { AnalysisFinding, ChallengeCase, Fine, RefundCase } from "@/types";
import { documentOf, evidenceFrom, fieldOf, makeFinding, type AnalysisContext } from "./finding";

function saleFinding(
  challenge: ChallengeCase,
  fine: Fine,
  ctx: AnalysisContext,
): AnalysisFinding | undefined {
  const bill = documentOf(challenge, "Bill of sale");
  if (!bill && challenge.reason !== "Vehicle sold before the fine") return undefined;
  const sale = fieldOf(bill, "Date of sale")?.value;
  const seller = fieldOf(bill, "Seller")?.value;
  const notTransferred = Boolean(sale && sale < fine.infractionDate && seller === fine.ownerName);
  return makeFinding(
    "R8",
    {
      caseId: challenge.id,
      category: "Registry",
      check: T.checks.sale,
      result: notTransferred ? "Flag" : "Info",
      evidence: bill
        ? `${evidenceFrom(bill, "Date of sale")}; RUNT owner record`
        : "From: RUNT owner record",
      confidence: notTransferred ? "High" : "Low",
      level: "H",
      ruleId: "R8",
      why: notTransferred
        ? fillTemplate(T.why.saleFlag, {
            sale: formatDate(sale ?? ""),
            infraction: formatDate(fine.infractionDate),
            owner: fine.ownerName,
          })
        : T.why.saleInfo,
    },
    ctx,
  );
}

/** SIMIT, RUNT and ANSV camera checks: R4, R6, R8 and the R10 bulk act. */
export function registryFindings(
  challenge: ChallengeCase,
  fine: Fine,
  ctx: AnalysisContext,
): AnalysisFinding[] {
  const nonCompliant = isFineOnNonCompliantCamera(fine, ctx);
  const values = {
    camera: fine.cameraId,
    date: formatDate(fine.infractionDate),
    image: fine.imagePlate,
    plate: fine.plate,
  };
  const findings: (AnalysisFinding | undefined)[] = [
    makeFinding(
      "R4",
      {
        caseId: challenge.id,
        category: "Registry",
        check: T.checks.camera,
        result: nonCompliant ? "Flag" : "Pass",
        evidence: "From: ANSV camera registry",
        confidence: "High",
        level: "A",
        ruleId: "R4",
        why: fillTemplate(nonCompliant ? T.why.cameraFlag : T.why.cameraPass, values),
      },
      ctx,
    ),
    makeFinding(
      "R6",
      {
        caseId: challenge.id,
        category: "Registry",
        check: T.checks.plate,
        result: fine.imagePlate === fine.plate ? "Pass" : "Flag",
        evidence: "From: camera image (plate reading) and RUNT",
        confidence: "Medium",
        level: "S",
        ruleId: "R6",
        why: fillTemplate(
          fine.imagePlate === fine.plate ? T.why.platePass : T.why.plateFlag,
          values,
        ),
      },
      ctx,
    ),
    saleFinding(challenge, fine, ctx),
  ];
  if (nonCompliant) {
    const act = actRevokingFine(fine, ctx);
    findings.push(
      makeFinding(
        "R10",
        {
          caseId: challenge.id,
          category: "Registry",
          check: T.checks.bulk,
          result: act ? "Pass" : "Flag",
          evidence: "From: legal acts register",
          confidence: "High",
          level: "S",
          ruleId: "R10",
          why: act ? fillTemplate(T.why.bulkPass, { act: act.number }) : T.why.bulkFlag,
        },
        ctx,
      ),
    );
  }
  return findings.filter((f): f is AnalysisFinding => Boolean(f));
}

/** R11 eligibility and the R12 approval threshold for a refund. */
export function refundRegistryFindings(
  refund: RefundCase,
  fine: Fine,
  ctx: AnalysisContext,
): AnalysisFinding[] {
  // A refund is never compared with itself: its own payment doesn't make it ineligible.
  const others = { ...ctx, refunds: ctx.refunds.filter((r) => r.id !== refund.id) };
  const eligibility = deriveRefundEligibility(fine, others);
  const aboveThreshold = refund.amount > RULES_CONFIG.refundHumanThreshold;
  const amounts = {
    amount: formatCOP(refund.amount),
    threshold: formatCOP(RULES_CONFIG.refundHumanThreshold),
  };
  return [
    makeFinding(
      "R11",
      {
        caseId: refund.id,
        category: "Registry",
        check: T.checks.eligibility,
        result: eligibility === "Eligible" ? "Pass" : "Flag",
        evidence: "From: SIMIT payment record and legal acts register",
        confidence: "High",
        level: "A",
        ruleId: "R11",
        why:
          eligibility === "Eligible"
            ? T.why.eligibilityPass
            : eligibility === "On hold"
              ? T.why.eligibilityHold
              : T.why.eligibilityFlag,
      },
      ctx,
    ),
    makeFinding(
      "threshold",
      {
        caseId: refund.id,
        category: "Registry",
        check: T.checks.threshold,
        result: aboveThreshold ? "Flag" : "Pass",
        evidence: "From: refund amount",
        confidence: "High",
        level: aboveThreshold ? "H" : "A",
        ruleId: "R12",
        why: fillTemplate(aboveThreshold ? T.why.thresholdFlag : T.why.thresholdPass, amounts),
      },
      ctx,
    ),
  ];
}
