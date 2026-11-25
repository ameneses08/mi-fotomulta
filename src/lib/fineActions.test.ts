import { describe, expect, it } from "vitest";
import { canStartChallenge, fineActions } from "@/lib/fineActions";
import { makeChallenge, makeFine, makeRefund } from "@/test/fixtures";
import type { ChallengeStatus } from "@/types";

const fine = makeFine();

describe("fineActions", () => {
  it("offers challenge and pay when there is no challenge", () => {
    expect(fineActions(fine, "Pending payment", undefined, undefined)).toEqual([
      "challenge",
      "pay",
    ]);
  });

  it.each<ChallengeStatus>([
    "Received",
    "Validating",
    "Needs correction",
    "Hearing scheduled",
    "Appealed",
  ])("shows only Track while the challenge is %s", (status) => {
    expect(
      fineActions(fine, "Challenge in progress", makeChallenge({ status }), undefined),
    ).toEqual(["track"]);
  });

  it("adds Appeal after a decision", () => {
    const decided = makeChallenge({ status: "Decided", outcome: "Upheld" });
    expect(fineActions(fine, "Pending payment", decided, undefined)).toEqual([
      "track",
      "appeal",
      "pay",
    ]);
  });

  it("offers the refund and no payment once revoked", () => {
    const decided = makeChallenge({ status: "Decided", outcome: "Revoked" });
    const paid = makeFine({ paidOn: "2026-11-01" });
    expect(fineActions(paid, "Revoked", decided, makeRefund())).toEqual([
      "track",
      "appeal",
      "refund",
    ]);
  });

  it("offers nothing for another authority's fine", () => {
    expect(fineActions(fine, "Another authority", undefined, undefined)).toEqual([]);
  });
});

describe("canStartChallenge", () => {
  it("blocks a second challenge on the same fine (R3)", () => {
    expect(canStartChallenge("F-1", [makeChallenge()])).toBe(false);
    expect(canStartChallenge("F-2", [makeChallenge()])).toBe(true);
  });
});
