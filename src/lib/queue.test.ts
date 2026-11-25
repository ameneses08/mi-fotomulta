import { describe, expect, it } from "vitest";
import {
  ALL_FILTERS,
  buildChallengeRows,
  buildGroups,
  filterRows,
  groupIdFor,
  priorityOf,
  summariseQueue,
} from "@/lib/queue";
import { makeAnalysisContext, makeChallenge, makeRefund } from "@/test/fixtures";
import type { AnalysisFinding } from "@/types";

const ctx = makeAnalysisContext({
  challenges: [
    makeChallenge({ id: "C-new", submittedOn: "2026-11-24", reason: "Other" }),
    makeChallenge({ id: "C-late", submittedOn: "2026-11-09" }),
    makeChallenge({ id: "C-done", submittedOn: "2026-11-02", status: "Decided" }),
    makeChallenge({ id: "C-rep1", submittedOn: "2026-11-20", representative: "Légal Firm S.A.S." }),
    makeChallenge({
      id: "C-rep2",
      submittedOn: "2026-11-23",
      representative: "Légal Firm S.A.S.",
      holder: "Inspector Andrés Ruiz",
    }),
  ],
  refunds: [makeRefund({ status: "Verifying payment details" })],
});
const rows = buildChallengeRows(ctx);

describe("triage", () => {
  it("rates priority from the legal clock and open flags", () => {
    const finding = (overrides: Partial<AnalysisFinding>): AnalysisFinding => ({
      id: "C-1:x",
      caseId: "C-1",
      category: "Registry",
      check: "",
      result: "Flag",
      evidence: "",
      confidence: "Medium",
      level: "A",
      why: "",
      reviewStatus: "Pending",
      ...overrides,
    });
    const calm = { used: 1, total: 10, risk: "On track" as const };
    expect(priorityOf({ used: 9, total: 10, risk: "At risk" }, [])).toBe("High");
    expect(priorityOf(calm, [finding({ category: "Fraud", confidence: "High" })])).toBe("High");
    expect(priorityOf(calm, [finding({})])).toBe("Medium");
    expect(priorityOf(calm, [finding({ reviewStatus: "Dismissed" })])).toBe("Low");
    expect(priorityOf(calm, [finding({ result: "Pass" })])).toBe("Low");
  });

  it("sorts open cases by priority and puts decided cases last", () => {
    expect(rows[0]?.challenge.id).toBe("C-late");
    expect(rows.at(-1)?.challenge.id).toBe("C-done");
  });

  it("labels cases that belong to a group", () => {
    expect(rows.find((r) => r.challenge.id === "C-rep1")?.groupId).toBe("legal-firm-s-a-s");
    expect(rows.find((r) => r.challenge.id === "C-new")?.groupId).toBeUndefined();
  });
});

describe("groups", () => {
  it("builds a URL-safe id without accents", () => {
    expect(groupIdFor("LegalRápido S.A.S.")).toBe("legalrapido-s-a-s");
  });

  it("groups open cases from the same representative", () => {
    expect(buildGroups(ctx.challenges).map((g) => g.cases.length)).toEqual([2]);
  });
});

describe("filterRows", () => {
  it("filters by priority, type and assignee", () => {
    expect(filterRows(rows, { ...ALL_FILTERS, type: "Other" }, "Laura Gómez")).toHaveLength(1);
    expect(filterRows(rows, { ...ALL_FILTERS, assignee: "Mine" }, "Andrés Ruiz")).toHaveLength(1);
    expect(filterRows(rows, ALL_FILTERS, "x")).toHaveLength(5);
  });
});

describe("summariseQueue", () => {
  it("counts open, at-risk and refunds to approve", () => {
    expect(summariseQueue(rows, ctx)).toMatchObject({
      openCases: 4,
      atRisk: 1,
      refundsToApprove: 1,
    });
  });
});
