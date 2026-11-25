import { describe, expect, it } from "vitest";
import { deriveFineStatus } from "@/lib/rules";
import { previewAct, registerAct } from "@/lib/revocation";
import {
  makeAct,
  makeChallenge,
  makeContext,
  makeFine,
  makeRefund,
  unauthorisedCamera,
} from "@/test/fixtures";

const timestamp = "2026-11-25T12:00:00.000Z";
const unpaidBad = makeFine({ id: "F-B1", cameraId: unauthorisedCamera.id });
const paidBad = makeFine({ id: "F-B2", cameraId: unauthorisedCamera.id, paidOn: "2026-11-05" });
const otherAuthority = makeFine({
  id: "F-X",
  cameraId: unauthorisedCamera.id,
  authorityId: "SOACHA",
});
const valid = makeFine({ id: "F-OK" });
const ctx = makeContext({
  fines: [unpaidBad, paidBad, otherAuthority, valid],
  refunds: [makeRefund({ id: "R-B2", fineId: "F-B2" })],
});

describe("previewAct", () => {
  it("affects only SDM fines from the act's non-compliant cameras", () => {
    const preview = previewAct(makeAct(), ctx);
    expect(preview.affectedFines.map((f) => f.id)).toEqual(["F-B1", "F-B2"]);
  });

  it("totals the refunds that the act releases", () => {
    const preview = previewAct(makeAct(), ctx);
    expect(preview.refundsToRelease.map((r) => r.id)).toEqual(["R-B2"]);
    expect(preview.totalRefund).toBe(650000);
  });

  it("skips fines already revoked by an inspector decision", () => {
    const decided = makeChallenge({ fineId: "F-B1", status: "Decided", outcome: "Revoked" });
    const preview = previewAct(makeAct(), { ...ctx, challenges: [decided] });
    expect(preview.affectedFines.map((f) => f.id)).toEqual(["F-B2"]);
  });
});

describe("registerAct", () => {
  it("puts the act in force and records who signed it", () => {
    const result = registerAct(makeAct(), ctx, "Laura Gómez", timestamp);
    expect(result.ok && result.act).toMatchObject({
      status: "In force",
      registeredBy: "Laura Gómez",
    });
  });

  it("writes one audit entry per affected fine plus the act and each refund", () => {
    const result = registerAct(makeAct(), ctx, "Laura Gómez", timestamp);
    if (!result.ok) throw new Error(result.error);
    const perFine = result.audit.filter((a) => a.action === "Fine revoked by legal act");
    expect(perFine.map((a) => a.caseId)).toEqual(["F-B1", "F-B2"]);
    expect(perFine[0]).toMatchObject({ from: "Under review", to: "Revoked" });
    expect(result.audit).toHaveLength(4);
  });

  it("moves refunds on hold to Eligible through changeStatus", () => {
    const result = registerAct(makeAct(), ctx, "Laura Gómez", timestamp);
    expect(result.ok && result.refunds[0]).toMatchObject({ status: "Eligible" });
  });

  it("makes the rules engine derive Revoked once the act is stored", () => {
    const result = registerAct(makeAct(), ctx, "Laura Gómez", timestamp);
    if (!result.ok) throw new Error(result.error);
    const after = { ...ctx, legalActs: [result.act], refunds: result.refunds };
    expect(deriveFineStatus(unpaidBad, after)).toBe("Revoked");
    expect(deriveFineStatus(valid, after)).toBe("Pending payment");
    expect(deriveFineStatus(otherAuthority, after)).toBe("Another authority");
  });

  it("requires the official's name and refuses an act already in force", () => {
    expect(registerAct(makeAct(), ctx, "  ", timestamp).ok).toBe(false);
    expect(registerAct(makeAct({ status: "In force" }), ctx, "Laura", timestamp).ok).toBe(false);
  });
});
