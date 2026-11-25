import { describe, expect, it } from "vitest";
import {
  challengeMessage,
  citizenHistory,
  holderLabel,
  refundMessage,
  trackerSteps,
} from "@/lib/messages";
import { createAuditEntry } from "@/lib/transitions";
import { makeChallenge, makeRefund } from "@/test/fixtures";

describe("status messages", () => {
  it("fills the case id into the Received message", () => {
    expect(challengeMessage(makeChallenge({ status: "Received", id: "C-1042" }))).toBe(
      "We received your challenge. Your reference is C-1042. We are checking your details.",
    );
  });

  it("fills the decision values", () => {
    const decided = makeChallenge({
      status: "Decided",
      messageValues: { outcome: "Revoked", plain_reason: "Driver identified", date: "09 Dec 2026" },
    });
    expect(challengeMessage(decided)).toBe(
      "Decision: Revoked. Reason: Driver identified. You can appeal until 09 Dec 2026.",
    );
  });

  it("fills the fine and amount into the Eligible refund message", () => {
    expect(refundMessage(makeRefund({ status: "Eligible" }))).toContain(
      "Your fine F-1 was revoked. Your refund of COP 650,000 is ready",
    );
  });

  it("names who holds the case", () => {
    expect(
      holderLabel(makeChallenge({ status: "Validating", holder: "Inspector Laura Gómez" })),
    ).toBe("Inspector Laura Gómez");
    expect(holderLabel(makeChallenge({ status: "Received" }))).toBe("Automatic checks");
  });
});

describe("trackerSteps", () => {
  it("maps Validating to Being checked", () => {
    const states = trackerSteps(makeChallenge({ status: "Validating" })).map((s) => s.state);
    expect(states).toEqual(["done", "current", "upcoming", "upcoming", "upcoming"]);
  });

  it("shows the hearing as skipped when decided without one", () => {
    const steps = trackerSteps(makeChallenge({ status: "Decided", hadHearing: false }));
    expect(steps.map((s) => s.state)).toEqual(["done", "done", "skipped", "current", "upcoming"]);
  });

  it("shows the hearing as done when one took place", () => {
    const steps = trackerSteps(makeChallenge({ status: "Decided", hadHearing: true }));
    expect(steps[2]?.state).toBe("done");
  });
});

describe("citizenHistory", () => {
  const entry = (action: string, timestamp: string) =>
    createAuditEntry({ caseId: "C-1", actor: "System", action, reason: "", timestamp });

  it("stops at the latest submission", () => {
    const entries = [
      entry("Status changed", "2026-11-25T10:01:00Z"),
      entry("Challenge submitted", "2026-11-25T10:00:00Z"),
      entry("Status changed", "2026-11-20T10:00:00Z"),
      entry("Challenge submitted", "2026-11-20T09:00:00Z"),
    ];
    expect(citizenHistory(entries).map((e) => e.timestamp)).toEqual([
      "2026-11-25T10:01:00Z",
      "2026-11-25T10:00:00Z",
    ]);
  });
});
