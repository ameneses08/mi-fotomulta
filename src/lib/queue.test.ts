import { describe, expect, it } from "vitest";
import { buildChallengeRows, buildRefundRows, groupSimilar, summariseQueue } from "@/lib/queue";
import { makeChallenge, makeContext, makeRefund } from "@/test/fixtures";

const today = "2026-11-25";
const ctx = makeContext({
  challenges: [
    makeChallenge({ id: "C-new", submittedOn: "2026-11-24" }),
    makeChallenge({ id: "C-late", submittedOn: "2026-11-09" }),
    makeChallenge({ id: "C-risk", submittedOn: "2026-11-13" }),
    makeChallenge({ id: "C-done", submittedOn: "2026-11-02", status: "Decided" }),
    makeChallenge({ id: "C-rep1", submittedOn: "2026-11-20", representative: "Firm" }),
    makeChallenge({ id: "C-rep2", submittedOn: "2026-11-23", representative: "Firm" }),
  ],
  refunds: [makeRefund({ status: "Verifying payment details" })],
});

describe("buildChallengeRows", () => {
  it("sorts open cases by deadline risk and puts decided cases last", () => {
    const ids = buildChallengeRows(ctx, today).map((r) => r.challenge.id);
    expect(ids).toEqual(["C-late", "C-risk", "C-rep1", "C-rep2", "C-new", "C-done"]);
  });
});

describe("groupSimilar", () => {
  it("collapses cases from the same representative into one group", () => {
    const items = groupSimilar(buildChallengeRows(ctx, today));
    const group = items.find((i) => i.type === "group");
    expect(items).toHaveLength(5);
    expect(group?.type === "group" && group.group.rows.map((r) => r.challenge.id)).toEqual([
      "C-rep1",
      "C-rep2",
    ]);
  });
});

describe("summariseQueue", () => {
  it("counts open, at-risk, refunds to approve and flagged cases", () => {
    const summary = summariseQueue(buildChallengeRows(ctx, today), buildRefundRows(ctx));
    expect(summary).toMatchObject({ openCases: 5, atRisk: 2, refundsToApprove: 1 });
    expect(summary.flagged).toBeGreaterThan(0);
  });
});
