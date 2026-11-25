import { describe, expect, it } from "vitest";
import { summariseCitizen } from "@/lib/citizenSummary";
import {
  makeAct,
  makeChallenge,
  makeContext,
  makeFine,
  makeRefund,
  unauthorisedCamera,
} from "@/test/fixtures";

const fines = [
  makeFine({ id: "F-1" }),
  makeFine({ id: "F-2", cameraId: unauthorisedCamera.id }),
  makeFine({ id: "F-3", cameraId: unauthorisedCamera.id, paidOn: "2026-11-01" }),
  makeFine({ id: "F-4", amount: 390000 }),
  makeFine({ id: "F-5", ownerDocument: "someone else" }),
];
const ctx = makeContext({
  fines,
  challenges: [makeChallenge({ fineId: "F-4" })],
  refunds: [makeRefund({ fineId: "F-3" })],
});

describe("summariseCitizen", () => {
  it("counts only the citizen's fines", () => {
    expect(summariseCitizen(ctx, "1").total).toBe(4);
  });

  it("totals fines to pay, fines in progress and money to recover", () => {
    const summary = summariseCitizen(ctx, "1");
    expect(summary.toPay).toEqual({ count: 1, amount: 650000 });
    expect(summary.inProgress).toBe(2);
    expect(summary.moneyToRecover).toBe(650000);
  });

  it("groups fines by derived status and follows the legal act", () => {
    const after = summariseCitizen({ ...ctx, legalActs: [makeAct({ status: "In force" })] }, "1");
    expect(after.byStatus.Revoked?.map((f) => f.id)).toEqual(["F-2", "F-3"]);
  });
});
