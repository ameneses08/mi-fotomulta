import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BULK_ACT_ID, HERO_CASE_ID, HERO_FINE_ID, HERO_REFUND_ID } from "@/data/mockData";
import { deriveFineStatus, deriveRefundEligibility } from "@/lib/rules";
import { rulesContextOf, SIMULATION_DELAYS, useAppStore } from "@/store/appStore";

const store = () => useAppStore.getState();
const fineStatus = (id: string) => {
  const fine = store().fines.find((f) => f.id === id);
  if (!fine) throw new Error(`Missing fine ${id}`);
  return deriveFineStatus(fine, rulesContextOf(store()));
};
const hero = () => store().challenges.find((c) => c.id === HERO_CASE_ID);
const heroRefund = () => store().refunds.find((r) => r.id === HERO_REFUND_ID);

function fillDraftToReview() {
  store().startChallenge(HERO_FINE_ID);
  store().setReason("I wasn't driving");
  store().nextStep();
  [0, 1, 2].forEach((i) => store().setFact(i, `Answer ${i}`));
  store().nextStep();
  store().addEvidence(["cedula.pdf"]);
  store().nextStep();
}

beforeEach(() => {
  vi.useFakeTimers();
  store().resetDemo();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("mock data", () => {
  it("gives Marta six fictional fines with the expected derived statuses (Scenario B)", () => {
    expect(store().fines.filter((f) => f.ownerName === store().citizen.name)).toHaveLength(6);
    expect(fineStatus("F-2042")).toBe("Under review");
    expect(fineStatus("F-2043")).toBe("Pending payment");
    expect(fineStatus("F-2044")).toBe("Refund on hold");
    expect(fineStatus("F-2045")).toBe("Paid");
    expect(fineStatus("F-2046")).toBe("Another authority");
  });

  it("keeps each seeded refund consistent with R11", () => {
    const ctx = rulesContextOf(store());
    const fine = ctx.fines.find((f) => f.id === "F-2044");
    expect(fine && deriveRefundEligibility(fine, ctx)).toBe(heroRefund()?.status);
  });

  it("has 12 challenges and 10 refunds for the staff queues", () => {
    expect(store().challenges).toHaveLength(12);
    expect(store().refunds).toHaveLength(10);
    expect(
      store().challenges.filter((c) => c.representative === "LegalRápido S.A.S."),
    ).toHaveLength(5);
  });
});

describe("challenge wizard", () => {
  it("limits each guided answer to 500 characters", () => {
    store().setFact(0, "a".repeat(501));
    expect(store().draft.facts[0]).toHaveLength(500);
  });

  it("requires a reason before progressing", () => {
    store().nextStep();
    expect(store().draft.step).toBe(0);
    expect(store().draftError).not.toBe("");
    store().setReason("I wasn't driving");
    store().nextStep();
    expect(store().draft.step).toBe(1);
  });

  it("drafts the request when reaching the review step", () => {
    fillDraftToReview();
    expect(store().draft.step).toBe(3);
    expect(store().draft.request).toContain("F-2041");
  });
});

describe("hero flow", () => {
  it("submits C-1042 as Received, then automatic checks move it to Validating with Laura", () => {
    fillDraftToReview();
    expect(store().submitChallenge()).toBe(HERO_CASE_ID);
    expect(hero()).toMatchObject({ status: "Received", holder: "Automatic checks" });
    vi.advanceTimersByTime(SIMULATION_DELAYS.checksDone);
    expect(hero()).toMatchObject({ status: "Validating", holder: "Inspector Laura Gómez" });
  });

  it("applies the inspector decision, audits it and revokes the fine", () => {
    const error = store().decideChallenge(HERO_CASE_ID, {
      kind: "Revoke",
      reason: "Driver identified",
      citizenMessage: "Dear Marta, your fine is revoked.",
      aiSuggestion: "Revoke",
    });
    expect(error).toBeNull();
    expect(hero()).toMatchObject({ status: "Decided", outcome: "Revoked" });
    expect(fineStatus(HERO_FINE_ID)).toBe("Revoked");
    const actions = store()
      .audit.filter((a) => a.caseId === HERO_CASE_ID)
      .map((a) => a.action);
    expect(actions).toContain("AI suggestion accepted");
  });

  it("rejects a decision without a reason", () => {
    const error = store().decideChallenge(HERO_CASE_ID, {
      kind: "Revoke",
      reason: "",
      citizenMessage: "x",
      aiSuggestion: "Revoke",
    });
    expect(error).not.toBeNull();
    expect(hero()?.status).toBe("Validating");
  });
});

describe("bulk revocation", () => {
  it("flips Scenario B to A: fines revoked, R-1044 eligible, one audit entry per fine", () => {
    expect(store().registerLegalAct(BULK_ACT_ID, "Laura Gómez")).toBeNull();
    expect(fineStatus("F-2042")).toBe("Revoked");
    expect(fineStatus("F-2044")).toBe("Revoked");
    expect(fineStatus("F-2043")).toBe("Pending payment");
    expect(heroRefund()?.status).toBe("Eligible");
    const perFine = store().audit.filter((a) => a.action === "Fine revoked by legal act");
    expect(perFine.length).toBeGreaterThanOrEqual(2);
  });

  it("reverts to Scenario B (demo only)", () => {
    store().registerLegalAct(BULK_ACT_ID, "Laura Gómez");
    store().revertLegalAct();
    expect(fineStatus("F-2042")).toBe("Under review");
    expect(heroRefund()?.status).toBe("On hold");
  });
});

describe("refund bank details", () => {
  const fill = () => {
    store().setBankField("bank", "Bancolombia");
    store().setBankField("account", "12345678");
  };

  it("requires the separate consent", () => {
    fill();
    store().saveBankDetails(HERO_REFUND_ID);
    expect(store().bankSaved).toBe(false);
    store().setBankField("consent", true);
    store().saveBankDetails(HERO_REFUND_ID);
    expect(store().bankSaved).toBe(true);
  });

  it("keeps the refund on hold in Scenario B after details are saved", () => {
    fill();
    store().setBankField("consent", true);
    store().saveBankDetails(HERO_REFUND_ID);
    expect(heroRefund()?.status).toBe("On hold");
  });

  it("verifies and approves automatically in Scenario A", () => {
    store().registerLegalAct(BULK_ACT_ID, "Laura Gómez");
    fill();
    store().setBankField("consent", true);
    store().saveBankDetails(HERO_REFUND_ID);
    expect(heroRefund()?.status).toBe("Verifying payment details");
    vi.advanceTimersByTime(SIMULATION_DELAYS.refundCheck);
    expect(heroRefund()?.status).toBe("Approved");
  });
});

describe("citizen assistant", () => {
  it("shows a typing indicator, then answers from live state", () => {
    store().askAssistant("Why is F-2042 under review?");
    expect(store().assistantTyping).toBe(true);
    vi.advanceTimersByTime(SIMULATION_DELAYS.assistantTyping);
    expect(store().assistantTyping).toBe(false);
    expect(store().assistantMessages.at(-1)?.text).toContain("CAM-NQS13");
  });

  it("changes its answer after the bulk act is registered", () => {
    store().registerLegalAct(BULK_ACT_ID, "Laura Gómez");
    store().askAssistant("Why is F-2042 under review?");
    vi.advanceTimersByTime(SIMULATION_DELAYS.assistantTyping);
    expect(store().assistantMessages.at(-1)?.text).toContain("revoked");
  });

  it("falls back to the suggested questions for anything else", () => {
    store().askAssistant("Tell me a joke");
    vi.advanceTimersByTime(SIMULATION_DELAYS.assistantTyping);
    expect(store().assistantMessages.at(-1)).toMatchObject({ showChips: true });
  });
});

describe("reset", () => {
  it("can start before Marta's challenge so the citizen journey begins fresh", () => {
    store().resetDemo("beforeChallenge");
    expect(hero()).toBeUndefined();
    expect(store().challenges).toHaveLength(11);
    expect(fineStatus(HERO_FINE_ID)).toBe("Pending payment");
  });

  it("restores the seeded demo data and cancels pending simulations", () => {
    fillDraftToReview();
    store().submitChallenge();
    store().resetDemo();
    vi.advanceTimersByTime(SIMULATION_DELAYS.checksDone);
    expect(hero()?.status).toBe("Validating");
    expect(
      store().audit.some(
        (a) => a.action === "Challenge submitted" && a.timestamp.startsWith("2026-11-25"),
      ),
    ).toBe(false);
  });
});
