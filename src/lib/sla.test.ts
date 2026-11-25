import { describe, expect, it } from "vitest";
import {
  addWorkingDays,
  challengeClock,
  expectedDateForChallenge,
  isWorkingDay,
  legalClock,
  workingDaysBetween,
} from "@/lib/sla";
import { makeChallenge } from "@/test/fixtures";

describe("working days", () => {
  it("treats Saturday and Sunday as non-working days", () => {
    expect(isWorkingDay("2026-11-27")).toBe(true); // Friday
    expect(isWorkingDay("2026-11-28")).toBe(false);
    expect(isWorkingDay("2026-11-29")).toBe(false);
  });

  it("adds working days without counting the start day", () => {
    expect(addWorkingDays("2026-11-25", 1)).toBe("2026-11-26");
    expect(addWorkingDays("2026-11-25", 2)).toBe("2026-11-27");
  });

  it("skips weekends when adding working days", () => {
    expect(addWorkingDays("2026-11-27", 1)).toBe("2026-11-30");
    expect(addWorkingDays("2026-11-12", 11)).toBe("2026-11-27");
  });

  it("starts counting from Monday when the start is a weekend", () => {
    expect(addWorkingDays("2026-11-28", 1)).toBe("2026-11-30");
  });

  it("counts working days between two dates", () => {
    expect(workingDaysBetween("2026-11-25", "2026-11-25")).toBe(0);
    expect(workingDaysBetween("2026-11-20", "2026-11-25")).toBe(3);
    expect(workingDaysBetween("2026-11-25", "2026-11-20")).toBe(0);
  });
});

describe("legal clocks", () => {
  it("is on track early in the window", () => {
    expect(legalClock("2026-11-20", "2026-11-25", 10)).toEqual({
      used: 3,
      total: 10,
      risk: "On track",
    });
  });

  it("is at risk from 70% of the window", () => {
    expect(legalClock("2026-11-11", "2026-11-20", 10).risk).toBe("At risk");
  });

  it("is overdue after the window", () => {
    expect(legalClock("2026-11-02", "2026-11-25", 10).risk).toBe("Overdue");
  });

  it("measures the decision clock from submission", () => {
    const clock = challengeClock(makeChallenge({ submittedOn: "2026-11-17" }), "2026-11-25");
    expect(clock).toMatchObject({ used: 6, total: 10 });
  });
});

describe("expected dates", () => {
  it("expects validation within 2 working days of receipt", () => {
    const challenge = makeChallenge({ status: "Received", submittedOn: "2026-11-25" });
    expect(expectedDateForChallenge(challenge)).toBe("2026-11-27");
  });

  it("expects a decision within 10 working days while validating", () => {
    const challenge = makeChallenge({ status: "Validating", submittedOn: "2026-11-25" });
    expect(expectedDateForChallenge(challenge)).toBe("2026-12-09");
  });

  it("uses the scheduled date for hearings and corrections", () => {
    const challenge = makeChallenge({
      status: "Hearing scheduled",
      messageValues: { dateIso: "2026-12-02" },
    });
    expect(expectedDateForChallenge(challenge)).toBe("2026-12-02");
  });

  it("has no expected date once decided", () => {
    expect(expectedDateForChallenge(makeChallenge({ status: "Decided" }))).toBeUndefined();
  });
});
