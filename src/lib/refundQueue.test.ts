import { describe, expect, it } from "vitest";
import { buildRefundQueue, fraudFlagsFor } from "@/lib/refundQueue";
import { makeAct, makeContext, makeFine, makeRefund, unauthorisedCamera } from "@/test/fixtures";
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

describe("fraudFlagsFor", () => {
  it("flags a holder who is not the claimant", () => {
    const refund = makeRefund({ bankAccount: account("1111", "999") });
    expect(fraudFlagsFor(refund, [refund])[0]).toMatch(/doesn't match the claimant/);
  });

  it("flags duplicate claims on the same fine", () => {
    const a = makeRefund({ id: "R-a", requestedOn: "2026-11-01" });
    const b = makeRefund({ id: "R-b", requestedOn: "2026-11-20" });
    expect(fraudFlagsFor(a, [a, b])).toEqual([]);
    expect(fraudFlagsFor(b, [a, b])[0]).toMatch(
      /Duplicate claim on fine F-1 \(already claimed in R-a\)/,
    );
  });

  it("flags one account receiving refunds from three claimants", () => {
    const shared = ["1", "2", "3"].map((doc) =>
      makeRefund({
        id: `R-${doc}`,
        fineId: `F-${doc}`,
        claimantDocument: doc,
        bankAccount: account("7730", doc),
      }),
    );
    expect(fraudFlagsFor(shared[0]!, shared)).toEqual([
      "Account ending 7730 receives 3 refunds from different claimants",
    ]);
  });
});

describe("buildRefundQueue", () => {
  const ctx = makeContext({
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
    expect(queue.held[0]?.holdReasons[0]).toBe("Above the COP 1,000,000 threshold");
  });

  it("never changes a refund's status while classifying", () => {
    expect(queue.fraud[0]?.refund.status).toBe("Verifying payment details");
  });
});
