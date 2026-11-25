import { describe, expect, it } from "vitest";
import { dateFindings } from "@/lib/analysis/dates";
import { makeAnalysisContext, makeChallenge, makeFine } from "@/test/fixtures";

const ctx = makeAnalysisContext();
const byRule = (findings: ReturnType<typeof dateFindings>, rule: string) =>
  findings.find((f) => f.ruleId === rule);

describe("dateFindings", () => {
  it("passes R1 within 11 working days of notification", () => {
    const f = byRule(
      dateFindings(makeChallenge({ submittedOn: "2026-11-19" }), makeFine(), ctx),
      "R1",
    );
    expect(f).toMatchObject({ result: "Pass", level: "A", confidence: "High", category: "Dates" });
  });

  it("flags R1 after the window without refusing the case", () => {
    const f = byRule(
      dateFindings(makeChallenge({ submittedOn: "2026-11-25" }), makeFine(), ctx),
      "R1",
    );
    expect(f?.result).toBe("Flag");
    expect(f?.why).toMatch(/never refused automatically/);
  });

  it("flags a notice sent 6 working days after the infraction as a possible nullity (R5)", () => {
    const fine = makeFine({ infractionDate: "2026-10-09", notificationDate: "2026-10-19" });
    const f = byRule(dateFindings(makeChallenge(), fine, ctx), "R5");
    expect(f).toMatchObject({ result: "Flag", level: "H" });
    expect(f?.why).toContain("6 working days");
    expect(f?.why).toContain("inspector decides");
  });

  it("gives every finding a stable id per case and rule", () => {
    expect(dateFindings(makeChallenge({ id: "C-9" }), makeFine(), ctx).map((f) => f.id)).toEqual([
      "C-9:R1",
      "C-9:R5",
    ]);
  });
});
