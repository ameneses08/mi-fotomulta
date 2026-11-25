import { describe, expect, it } from "vitest";
import { deriveFineStatus, deriveRefundEligibility, isCameraAuthorisedOn } from "@/lib/rules";
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
