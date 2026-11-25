import { describe, expect, it } from "vitest";
import {
  autoVerifyRefund,
  decideRefund,
  EMPTY_BANK_FORM,
  recoverableAmount,
  submitBankDetails,
  validateBankForm,
} from "@/lib/refund";
import { makeAct, makeContext, makeFine, makeRefund, unauthorisedCamera } from "@/test/fixtures";
import type { Citizen } from "@/types";

const citizen: Citizen = { name: "Test Owner", firstName: "Test", document: "1", plate: "AAA111" };
const form = { bank: "Bancolombia", type: "Savings" as const, account: "12345678", consent: true };
const timestamp = "2026-11-25T12:00:00.000Z";

describe("validateBankForm", () => {
  it("requires a bank and a 6–20 digit account", () => {
    expect(validateBankForm({ ...form, account: "12a" })).not.toBeNull();
    expect(validateBankForm({ ...form, bank: "" })).not.toBeNull();
  });

  it("requires the separate consent", () => {
    expect(validateBankForm({ ...form, consent: false })).toMatch(/consent/);
    expect(validateBankForm(form)).toBeNull();
  });

  it("starts empty with consent unticked", () => {
    expect(EMPTY_BANK_FORM.consent).toBe(false);
  });
});

describe("submitBankDetails", () => {
  it("moves an eligible refund to verification and stores only the last four digits", () => {
    const result = submitBankDetails(makeRefund({ status: "Eligible" }), form, citizen, timestamp);
    expect(result.ok && result.refund.status).toBe("Verifying payment details");
    expect(result.ok && result.refund.bankAccount?.last4).toBe("5678");
    expect(result.ok && result.refund.consent?.givenOn).toBe(timestamp);
  });

  it("keeps a refund on hold but saves the details", () => {
    const result = submitBankDetails(makeRefund({ status: "On hold" }), form, citizen, timestamp);
    expect(result.ok && result.refund.status).toBe("On hold");
    expect(result.ok && result.audit).toEqual([]);
  });
});

describe("decideRefund and autoVerifyRefund", () => {
  const paidRevoked = makeFine({ cameraId: unauthorisedCamera.id, paidOn: "2026-11-05" });
  const ctx = makeContext({ fines: [paidRevoked], legalActs: [makeAct({ status: "In force" })] });
  const account = {
    bank: "B",
    type: "Savings" as const,
    last4: "5678",
    holderName: "Test Owner",
    holderDocument: "1",
  };

  it("approves with an expected payment date 5 working days later", () => {
    const refund = makeRefund({ status: "Verifying payment details" });
    const result = decideRefund(
      refund,
      "Approve",
      "Laura Gómez",
      "Verified",
      "2026-11-25",
      timestamp,
    );
    expect(result.ok && result.refund.messageValues).toMatchObject({ date: "02 Dec 2026" });
  });

  it("approves automatically when R11 and R12 pass at level A", () => {
    const refund = makeRefund({ status: "Verifying payment details", bankAccount: account });
    const result = autoVerifyRefund(refund, { ...ctx, refunds: [refund] }, "2026-11-25", timestamp);
    expect(result?.ok && result.refund.status).toBe("Approved");
  });

  it("leaves a holder mismatch for a human", () => {
    const refund = makeRefund({
      status: "Verifying payment details",
      bankAccount: { ...account, holderDocument: "2" },
    });
    expect(
      autoVerifyRefund(refund, { ...ctx, refunds: [refund] }, "2026-11-25", timestamp),
    ).toBeNull();
  });
});

describe("recoverableAmount", () => {
  it("sums the citizen's open refunds only", () => {
    const refunds = [
      makeRefund({ id: "R-1", status: "On hold" }),
      makeRefund({ id: "R-2", status: "Paid" }),
      makeRefund({ id: "R-3", claimantDocument: "2" }),
    ];
    expect(recoverableAmount(refunds, "1")).toBe(650000);
  });
});
