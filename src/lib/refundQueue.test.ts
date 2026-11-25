import { describe, expect, it } from "vitest";
import { buildRefundQueue } from "@/lib/refundQueue";
import {
  makeAct,
  makeAnalysisContext,
  makeFine,
  makeRefund,
  unauthorisedCamera,
} from "@/test/fixtures";
import type { BankAccount } from "@/types";

const account = (last4: string, holderDocument = "1"): BankAccount => ({
  bank: "B",
  type: "Savings",
  last4,
  holderName: "Holder",
  holderDocument,
});
const paid = (id: string, amount = 650000) =>
  makeFine({ id, cameraId: unauthorisedCamera.id, paidOn: "2026-11-01", amount });

describe("buildRefundQueue", () => {
  const ctx = makeAnalysisContext({
    fines: [paid("F-1"), paid("F-2", 1_250_000), paid("F-3"), paid("F-4")],
    legalActs: [makeAct({ status: "In force" })],
    refunds: [
      makeRefund({ id: "R-auto", fineId: "F-1", status: "Approved", bankAccount: account("0001") }),
      makeRefund({
        id: "R-high",
        fineId: "F-2",
        amount: 1_250_000,
        status: "Verifying payment details",
        bankAccount: account("0002"),
      }),
      makeRefund({
        id: "R-fraud",
        fineId: "F-3",
        status: "Verifying payment details",
        bankAccount: account("0003", "9"),
      }),
      makeRefund({ id: "R-wait", fineId: "F-4", status: "Eligible" }),
    ],
  });
  const queue = buildRefundQueue(ctx);
  const ids = (section: keyof typeof queue) => queue[section].map((i) => i.refund.id);

  it("sorts refunds into auto-approved, held, fraud and waiting", () => {
    expect(ids("autoApproved")).toEqual(["R-auto"]);
    expect(ids("held")).toEqual(["R-high"]);
    expect(ids("fraud")).toEqual(["R-fraud"]);
    expect(ids("waiting")).toEqual(["R-wait"]);
  });

  it("explains why a refund is held", () => {
    expect(queue.held[0]?.holdReasons[0]?.why).toMatch(/above the COP 1,000,000 threshold/);
  });

  it("never changes a refund's status while classifying", () => {
    expect(queue.fraud[0]?.refund.status).toBe("Verifying payment details");
  });
});
