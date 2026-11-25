import { describe, expect, it } from "vitest";
import { RULES } from "@/data/ruleCatalogue";
import { splitRuleCodes } from "./ruleText";

describe("splitRuleCodes", () => {
  it("separates rule IDs from the surrounding text", () => {
    expect(splitRuleCodes("Automatic checks R1, R3 completed")).toEqual([
      "Automatic checks ",
      { ruleId: "R1" },
      ", ",
      { ruleId: "R3" },
      " completed",
    ]);
  });

  it("matches R10–R12 whole, not as R1 followed by a digit", () => {
    expect(splitRuleCodes("R11 and R12")).toEqual([{ ruleId: "R11" }, " and ", { ruleId: "R12" }]);
  });

  it("ignores codes that are not rules or are part of a word", () => {
    expect(splitRuleCodes("R13 and R-1047 and CAR63")).toEqual(["R13 and R-1047 and CAR63"]);
  });
});

describe("rule catalogue", () => {
  it("gives every rule a plain-language label and a one-sentence rule", () => {
    for (const rule of Object.values(RULES)) {
      expect(rule.label.length).toBeGreaterThan(0);
      expect(rule.rule).toMatch(/^[A-Z].*\.$/);
    }
    expect(RULES.R5.label).toBe("Notice sent on time");
    expect(RULES.R12.label).toBe("Refund payment check");
  });
});
