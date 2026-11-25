import { describe, expect, it } from "vitest";
import { INTAKE_STEPS, intakeSteps, isIntakeComplete, summariseIntake } from "@/lib/intake";
import { buildChallengeRows } from "@/lib/queue";
import { makeAnalysisContext, makeChallenge } from "@/test/fixtures";

describe("intake progress", () => {
  it("has the six scripted steps", () => {
    expect(INTAKE_STEPS).toEqual([
      "Reading documents",
      "Checking dates",
      "Checking registries",
      "Comparing with similar cases",
      "Fraud screening",
      "Summary ready",
    ]);
  });

  it("marks steps done, current and upcoming", () => {
    expect(intakeSteps(2).map((s) => s.state)).toEqual([
      "done",
      "done",
      "current",
      "upcoming",
      "upcoming",
      "upcoming",
    ]);
  });

  it("treats cases without progress as already analysed", () => {
    expect(isIntakeComplete("C-1", {})).toBe(true);
    expect(isIntakeComplete("C-1", { "C-1": 3 })).toBe(false);
    expect(isIntakeComplete("C-1", { "C-1": 6 })).toBe(true);
  });
});

describe("summariseIntake", () => {
  const ctx = makeAnalysisContext({
    challenges: [
      makeChallenge({ id: "C-a", evidence: [] }),
      makeChallenge({ id: "C-b", fineId: "F-2", representative: "Firm" }),
      makeChallenge({ id: "C-c", fineId: "F-3", representative: "Firm" }),
      makeChallenge({ id: "C-d", fineId: "F-4", status: "Decided" }),
    ],
  });

  it("splits analysed filings into clear and with flags, skipping running intakes", () => {
    const rows = buildChallengeRows(ctx);
    const summary = summariseIntake(rows, { "C-c": 2 });
    expect(summary.analysed).toBe(2);
    expect(summary.clear + summary.flagged).toBe(summary.analysed);
    expect(summary.grouped).toBe(1);
  });
});
