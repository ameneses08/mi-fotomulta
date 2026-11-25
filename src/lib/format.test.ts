import { describe, expect, it } from "vitest";
import { fillTemplate, formatCOP, formatDate, lastFour } from "@/lib/format";

describe("format", () => {
  it("formats Colombian pesos", () => {
    expect(formatCOP(650000)).toBe("COP 650,000");
  });

  it("formats ISO dates without time-zone drift", () => {
    expect(formatDate("2026-11-02")).toBe("02 Nov 2026");
    expect(formatDate("2026-12-31T23:59:00Z")).toBe("31 Dec 2026");
  });

  it("fills placeholders and leaves unknown ones visible", () => {
    expect(fillTemplate("Case {case_id} on {date}", { case_id: "C-1" })).toBe("Case C-1 on {date}");
  });

  it("keeps the last four digits of an account", () => {
    expect(lastFour("1234567890")).toBe("7890");
  });
});
