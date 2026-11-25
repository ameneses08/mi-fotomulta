import { describe, expect, it } from "vitest";
import {
  allowedNextStatuses,
  CHALLENGE_TRANSITIONS,
  changeStatus,
  REFUND_TRANSITIONS,
} from "@/lib/transitions";
import { makeChallenge, makeRefund } from "@/test/fixtures";
import type { ChallengeStatus, RefundStatus } from "@/types";

const options = { timestamp: "2026-11-25T10:00:00.000Z" };

describe("transition tables", () => {
  it("lists the allowed next challenge statuses from the spec", () => {
    expect(CHALLENGE_TRANSITIONS.Validating).toEqual([
      "Needs correction",
      "Hearing scheduled",
      "Decided",
    ]);
    expect(CHALLENGE_TRANSITIONS.Closed).toEqual([]);
  });

  it("lists the allowed next refund statuses from the spec", () => {
    expect(REFUND_TRANSITIONS["On hold"]).toEqual(["Eligible", "Rejected"]);
    expect(REFUND_TRANSITIONS.Paid).toEqual([]);
  });

  it("exposes allowed next statuses for an entity", () => {
    expect(allowedNextStatuses(makeChallenge({ status: "Received" }))).toEqual(["Validating"]);
  });
});

describe("changeStatus", () => {
  it("applies an allowed challenge transition and writes an audit entry", () => {
    const result = changeStatus(
      makeChallenge({ status: "Received" }),
      "Validating",
      "System",
      "Checks started",
      options,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.entity.status).toBe("Validating");
    expect(result.audit).toMatchObject({
      caseId: "C-1",
      actor: "System",
      from: "Received",
      to: "Validating",
      reason: "Checks started",
      timestamp: options.timestamp,
    });
  });

  it("rejects a transition that is not in the table", () => {
    const result = changeStatus(
      makeChallenge({ status: "Received" }),
      "Decided",
      "Laura Gómez",
      "Too early",
      options,
    );
    expect(result).toEqual({ ok: false, error: 'C-1 cannot move from "Received" to "Decided".' });
  });

  it("rejects a status that belongs to the other entity type", () => {
    const refund = makeRefund({ status: "Eligible" });
    const result = changeStatus(
      refund,
      "Validating" as RefundStatus,
      "System",
      "Wrong table",
      options,
    );
    expect(result.ok).toBe(false);
  });

  it("requires a reason", () => {
    const result = changeStatus(
      makeRefund({ status: "On hold" }),
      "Eligible",
      "System",
      "  ",
      options,
    );
    expect(result.ok).toBe(false);
  });

  it("replaces message values with the new status values", () => {
    const refund = makeRefund({ status: "On hold", messageValues: { old: "x" } });
    const result = changeStatus(refund, "Eligible", "System", "Act in force", {
      ...options,
      messageValues: { fine_id: "F-1" },
    });
    expect(result.ok && result.entity.messageValues).toEqual({ fine_id: "F-1" });
  });

  it("never mutates the original entity", () => {
    const challenge = makeChallenge({ status: "Validating" });
    changeStatus(challenge, "Decided", "Laura Gómez", "Decision", options);
    expect(challenge.status).toBe("Validating");
  });

  it.each<[ChallengeStatus, ChallengeStatus]>([
    ["Validating", "Needs correction"],
    ["Needs correction", "Validating"],
    ["Hearing scheduled", "Decided"],
    ["Decided", "Appealed"],
    ["Appealed", "Decided"],
  ])("allows challenge %s → %s", (from, to) => {
    expect(changeStatus(makeChallenge({ status: from }), to, "System", "ok", options).ok).toBe(
      true,
    );
  });

  it.each<[RefundStatus, RefundStatus]>([
    ["Eligible", "Verifying payment details"],
    ["Verifying payment details", "Approved"],
    ["Verifying payment details", "Needs correction"],
    ["Verifying payment details", "Rejected"],
    ["Approved", "Paid"],
    ["Rejected", "Appealed"],
  ])("allows refund %s → %s", (from, to) => {
    expect(changeStatus(makeRefund({ status: from }), to, "System", "ok", options).ok).toBe(true);
  });

  it.each<[RefundStatus, RefundStatus]>([
    ["On hold", "Paid"],
    ["Paid", "Approved"],
    ["Eligible", "Approved"],
  ])("rejects refund %s → %s", (from, to) => {
    expect(changeStatus(makeRefund({ status: from }), to, "System", "no", options).ok).toBe(false);
  });
});
