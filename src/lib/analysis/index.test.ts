import { describe, expect, it } from "vitest";
import { analyseCase, analyseRefund, flagLabels } from "@/lib/analysis";
import {
  driverDocuments,
  makeAnalysisContext,
  makeChallenge,
  makeFine,
  makeRefund,
} from "@/test/fixtures";

const challenge = makeChallenge({
  id: "C-1",
  evidence: driverDocuments(),
  submittedOn: "2026-11-10",
});
const ctx = makeAnalysisContext({ fines: [makeFine()], challenges: [challenge] });

describe("analyseCase", () => {
  it("runs every module and summarises the result", () => {
    const analysis = analyseCase("C-1", ctx);
    expect(new Set(analysis?.findings.map((f) => f.category))).toEqual(
      new Set(["Dates", "Documents", "Registry", "Fraud"]),
    );
    expect(analysis?.summary).toMatch(/^\d+ of \d+ checks passed; 0 need an inspector\./);
  });

  it("is deterministic: the same input gives the same findings", () => {
    expect(analyseCase("C-1", ctx)).toEqual(analyseCase("C-1", ctx));
  });

  it("merges inspector reviews and drops dismissed flags from the open flags", () => {
    const late = makeChallenge({
      id: "C-2",
      fineId: "F-1",
      submittedOn: "2026-11-25",
      evidence: driverDocuments(),
    });
    const base = makeAnalysisContext({ fines: [makeFine()], challenges: [late] });
    expect(flagLabels(analyseCase("C-2", base))).toContain("R1");
    const reviewed = {
      ...base,
      reviews: {
        "C-2:R1": {
          status: "Dismissed" as const,
          reason: "Notice arrived late",
          reviewedBy: "Laura",
          timestamp: "t",
        },
      },
    };
    const finding = analyseCase("C-2", reviewed)?.findings.find((f) => f.id === "C-2:R1");
    expect(finding).toMatchObject({
      reviewStatus: "Dismissed",
      reviewReason: "Notice arrived late",
      reviewedBy: "Laura",
    });
    expect(flagLabels(analyseCase("C-2", reviewed))).not.toContain("R1");
  });

  it("returns undefined for an unknown case", () => {
    expect(analyseCase("nope", ctx)).toBeUndefined();
  });
});

describe("analyseRefund", () => {
  it("combines registry and fraud findings", () => {
    const refund = makeRefund({ fineId: "F-1" });
    const analysis = analyseRefund(
      "R-1",
      makeAnalysisContext({ fines: [makeFine({ paidOn: "2026-11-01" })], refunds: [refund] }),
    );
    expect(analysis?.findings.map((f) => f.id.split(":")[1])).toEqual([
      "R11",
      "threshold",
      "holder",
      "duplicate-claim",
      "account-reuse",
    ]);
  });
});
