import { describe, expect, it } from "vitest";
import {
  deriveFineStatus,
  deriveRefundEligibility,
  evaluateChallengeRules,
  evaluateRefundRules,
  flaggedRules,
  isCameraAuthorisedOn,
} from "@/lib/rules";
import {
  authorisedCamera,
  makeAct,
  makeChallenge,
  makeContext,
  makeFine,
  makeRefund,
  unauthorisedCamera,
} from "@/test/fixtures";

const inForce = makeAct({ status: "In force" });
const badFine = makeFine({ cameraId: unauthorisedCamera.id });
const paidBadFine = makeFine({ cameraId: unauthorisedCamera.id, paidOn: "2026-11-05" });

function resultOf(ruleId: string, checks: ReturnType<typeof evaluateChallengeRules>) {
  return checks.find((c) => c.ruleId === ruleId)?.result;
}

describe("R4 camera authorisation", () => {
  it("checks the authorisation window on the infraction date", () => {
    const camera = {
      ...authorisedCamera,
      authorisedFrom: "2026-01-01",
      authorisedUntil: "2026-06-30",
    };
    expect(isCameraAuthorisedOn(camera, "2026-03-01")).toBe(true);
    expect(isCameraAuthorisedOn(camera, "2026-07-01")).toBe(false);
    expect(isCameraAuthorisedOn(unauthorisedCamera, "2026-03-01")).toBe(false);
  });
});

describe("deriveFineStatus", () => {
  it("redirects fines from another authority (R2)", () => {
    expect(deriveFineStatus(makeFine({ authorityId: "SOACHA" }), makeContext())).toBe(
      "Another authority",
    );
  });

  it("derives Pending payment and Paid for authorised cameras", () => {
    expect(deriveFineStatus(makeFine(), makeContext())).toBe("Pending payment");
    expect(deriveFineStatus(makeFine({ paidOn: "2026-11-05" }), makeContext())).toBe("Paid");
  });

  it("puts non-compliant camera fines under review while no act is in force (Scenario B)", () => {
    expect(deriveFineStatus(badFine, makeContext())).toBe("Under review");
    expect(deriveFineStatus(paidBadFine, makeContext())).toBe("Refund on hold");
  });

  it("revokes non-compliant camera fines once the act is in force (Scenario A)", () => {
    const ctx = makeContext({ legalActs: [inForce] });
    expect(deriveFineStatus(badFine, ctx)).toBe("Revoked");
    expect(deriveFineStatus(paidBadFine, ctx)).toBe("Revoked");
  });

  it("never revokes an authorised camera fine through the act", () => {
    expect(deriveFineStatus(makeFine(), makeContext({ legalActs: [inForce] }))).toBe(
      "Pending payment",
    );
  });

  it("shows an open challenge", () => {
    const ctx = makeContext({ challenges: [makeChallenge({ status: "Validating" })] });
    expect(deriveFineStatus(makeFine(), ctx)).toBe("Challenge in progress");
  });

  it("revokes the fine when the inspector decides Revoked", () => {
    const ctx = makeContext({
      challenges: [makeChallenge({ status: "Decided", outcome: "Revoked" })],
    });
    expect(deriveFineStatus(makeFine(), ctx)).toBe("Revoked");
  });

  it("returns to Pending payment when the challenge is upheld", () => {
    const ctx = makeContext({
      challenges: [makeChallenge({ status: "Decided", outcome: "Upheld" })],
    });
    expect(deriveFineStatus(makeFine(), ctx)).toBe("Pending payment");
  });
});

describe("deriveRefundEligibility (R11)", () => {
  it("is on hold when paid with no act in force", () => {
    expect(deriveRefundEligibility(paidBadFine, makeContext())).toBe("On hold");
  });

  it("is eligible when paid and revoked by an act", () => {
    expect(deriveRefundEligibility(paidBadFine, makeContext({ legalActs: [inForce] }))).toBe(
      "Eligible",
    );
  });

  it("is not eligible once refunded", () => {
    const ctx = makeContext({ legalActs: [inForce], refunds: [makeRefund({ status: "Paid" })] });
    expect(deriveRefundEligibility(paidBadFine, ctx)).toBe("Not eligible");
  });

  it("is not eligible for unpaid or valid fines", () => {
    expect(deriveRefundEligibility(badFine, makeContext())).toBe("Not eligible");
    expect(deriveRefundEligibility(makeFine({ paidOn: "2026-11-05" }), makeContext())).toBe(
      "Not eligible",
    );
  });
});

describe("evaluateChallengeRules", () => {
  it("passes the deadline when filed within 11 working days (R1)", () => {
    const checks = evaluateChallengeRules(
      makeChallenge({ submittedOn: "2026-11-19" }),
      makeContext(),
    );
    expect(resultOf("R1", checks)).toBe("Pass");
  });

  it("fails the deadline when filed late, without closing the case (R1)", () => {
    const challenge = makeChallenge({ submittedOn: "2026-11-25" });
    expect(resultOf("R1", evaluateChallengeRules(challenge, makeContext()))).toBe("Fail");
    expect(challenge.status).toBe("Validating");
  });

  it("flags duplicates on the same fine (R3)", () => {
    const first = makeChallenge();
    const second = makeChallenge({ id: "C-2" });
    const ctx = makeContext({ challenges: [first, second] });
    expect(resultOf("R3", evaluateChallengeRules(first, ctx))).toBe("Flag");
  });

  it("flags late notification for a human (R5)", () => {
    const ctx = makeContext({ fines: [makeFine({ notificationDate: "2026-11-20" })] });
    expect(resultOf("R5", evaluateChallengeRules(makeChallenge(), ctx))).toBe("Flag");
  });

  it("flags a plate mismatch (R6)", () => {
    const ctx = makeContext({ fines: [makeFine({ imagePlate: "AAA117" })] });
    expect(resultOf("R6", evaluateChallengeRules(makeChallenge(), ctx))).toBe("Flag");
  });

  it("always leaves the driver question to a human (R7)", () => {
    const r7 = evaluateChallengeRules(makeChallenge(), makeContext()).find(
      (c) => c.ruleId === "R7",
    );
    expect(r7).toMatchObject({ level: "H", result: "Flag" });
  });

  it("flags templated arguments from a representative (R9)", () => {
    const challenge = makeChallenge({ representative: "LegalRápido S.A.S." });
    expect(resultOf("R9", evaluateChallengeRules(challenge, makeContext()))).toBe("Flag");
  });

  it("applies bulk revocation only while the act is in force (R10)", () => {
    const ctx = makeContext({ fines: [badFine] });
    expect(resultOf("R10", evaluateChallengeRules(makeChallenge(), ctx))).toBe("Flag");
    const inForceCtx = { ...ctx, legalActs: [inForce] };
    expect(resultOf("R10", evaluateChallengeRules(makeChallenge(), inForceCtx))).toBe("Pass");
  });

  it("lists rule ids that need attention", () => {
    const checks = evaluateChallengeRules(
      makeChallenge({ submittedOn: "2026-11-25" }),
      makeContext(),
    );
    expect(flaggedRules(checks)).toEqual(["R1", "R7"]);
  });
});

describe("evaluateRefundRules (R12)", () => {
  const account = {
    bank: "Bancolombia",
    type: "Savings" as const,
    last4: "1234",
    holderName: "Test Owner",
    holderDocument: "1",
  };
  const ctx = makeContext({ fines: [paidBadFine], legalActs: [inForce] });

  it("passes an account in the claimant's name below the threshold", () => {
    const [, r12] = evaluateRefundRules(makeRefund({ bankAccount: account }), ctx);
    expect(r12).toMatchObject({ result: "Pass", level: "A" });
  });

  it("fails and escalates when the holder is someone else", () => {
    const refund = makeRefund({
      bankAccount: { ...account, holderDocument: "2", holderName: "Other" },
    });
    expect(evaluateRefundRules(refund, ctx)[1]).toMatchObject({ result: "Fail", level: "H" });
  });

  it("needs a human above the threshold", () => {
    const refund = makeRefund({ amount: 2_500_000, bankAccount: account });
    expect(evaluateRefundRules(refund, ctx)[1]).toMatchObject({ result: "Flag", level: "H" });
  });
});
