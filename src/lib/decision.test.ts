import { describe, expect, it } from "vitest";
import { applyDecision, availableDecisions, type DecisionInput } from "@/lib/decision";
import { makeChallenge } from "@/test/fixtures";

const input: DecisionInput = {
  kind: "Revoke",
  reason: "The owner cannot be presumed to be the driver.",
  citizenMessage: "Dear Marta, we revoked your fine.",
  inspector: "Laura Gómez",
  aiSuggestion: "Revoke",
  today: "2026-11-25",
  timestamp: "2026-11-25T11:00:00.000Z",
};

describe("availableDecisions", () => {
  it("offers all five decisions while validating", () => {
    expect(availableDecisions("Validating")).toHaveLength(5);
  });

  it("offers only final decisions after a hearing", () => {
    expect(availableDecisions("Hearing scheduled")).toEqual(["Revoke", "Uphold", "Partly uphold"]);
  });

  it("offers nothing while automatic checks run or after a decision", () => {
    expect(availableDecisions("Received")).toEqual([]);
    expect(availableDecisions("Decided")).toEqual([]);
  });
});

describe("applyDecision", () => {
  it("decides the case and fills the decision message values", () => {
    const result = applyDecision(makeChallenge(), input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.entity).toMatchObject({
      status: "Decided",
      outcome: "Revoked",
      citizenNote: "Dear Marta, we revoked your fine.",
    });
    expect(result.entity.messageValues).toMatchObject({
      outcome: "Revoked",
      plain_reason: "The owner cannot be presumed to be the driver",
      date: "09 Dec 2026",
    });
  });

  it("writes a status audit entry and records that the AI suggestion was accepted", () => {
    const result = applyDecision(makeChallenge(), input);
    expect(result.ok && result.audit.map((a) => a.action)).toEqual([
      "Status changed",
      "AI suggestion accepted",
    ]);
  });

  it("records an override when the inspector disagrees with the AI", () => {
    const result = applyDecision(makeChallenge(), { ...input, kind: "Uphold" });
    expect(result.ok && result.audit[1]?.action).toBe("AI suggestion overridden");
    expect(result.ok && result.entity.outcome).toBe("Upheld");
  });

  it("schedules a hearing with a date and marks that a hearing happened", () => {
    const result = applyDecision(makeChallenge(), { ...input, kind: "Schedule hearing" });
    expect(result.ok && result.entity.status).toBe("Hearing scheduled");
    expect(result.ok && result.entity.hadHearing).toBe(true);
    expect(result.ok && result.entity.messageValues["dateIso"]).toBe("2026-12-02");
  });

  it("requests a correction using the reason as the missing item", () => {
    const result = applyDecision(makeChallenge(), {
      ...input,
      kind: "Request correction",
      reason: "a statement signed by the driver",
    });
    expect(result.ok && result.entity.messageValues["what"]).toBe(
      "a statement signed by the driver",
    );
  });

  it("requires a reason and a citizen message", () => {
    expect(applyDecision(makeChallenge(), { ...input, reason: " " }).ok).toBe(false);
    expect(applyDecision(makeChallenge(), { ...input, citizenMessage: "" }).ok).toBe(false);
  });

  it("refuses a decision the current status does not allow", () => {
    expect(applyDecision(makeChallenge({ status: "Received" }), input).ok).toBe(false);
  });
});
