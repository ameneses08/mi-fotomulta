import { describe, expect, it } from "vitest";
import { fieldVerificationEntry, reviewFinding } from "@/lib/analysis/review";
import type { AnalysisFinding } from "@/types";

const flag: AnalysisFinding = {
  id: "C-1:R1",
  caseId: "C-1",
  category: "Dates",
  check: "Filed within 11 working days",
  result: "Flag",
  evidence: "",
  confidence: "High",
  level: "A",
  why: "",
  reviewStatus: "Pending",
};
const t = "2026-11-25T10:00:00.000Z";

describe("reviewFinding", () => {
  it("confirms a flag and writes an audit entry with the inspector's name", () => {
    const result = reviewFinding(flag, "Confirmed", "", "Laura Gómez", t);
    expect(result.ok && result.review).toMatchObject({
      status: "Confirmed",
      reviewedBy: "Laura Gómez",
    });
    expect(result.ok && result.audit).toMatchObject({
      actor: "Laura Gómez",
      action: "AI flag confirmed",
      caseId: "C-1",
    });
  });

  it("requires a reason to dismiss a flag as a false positive", () => {
    expect(reviewFinding(flag, "Dismissed", " ", "Laura Gómez", t).ok).toBe(false);
    const result = reviewFinding(flag, "Dismissed", "Notice was late", "Laura Gómez", t);
    expect(result.ok && result.audit.reason).toBe("Filed within 11 working days: Notice was late");
  });

  it("refuses to review a pass or an already reviewed flag", () => {
    expect(reviewFinding({ ...flag, result: "Pass" }, "Confirmed", "", "L", t).ok).toBe(false);
    expect(reviewFinding({ ...flag, reviewStatus: "Confirmed" }, "Dismissed", "x", "L", t).ok).toBe(
      false,
    );
  });
});

describe("fieldVerificationEntry", () => {
  it("records verifying and un-verifying a field", () => {
    expect(fieldVerificationEntry("C-1", "ID copy – Full name", true, "Laura", t).action).toBe(
      "Extracted field verified",
    );
    expect(fieldVerificationEntry("C-1", "ID copy – Full name", false, "Laura", t).action).toBe(
      "Field verification removed",
    );
  });
});
