import { beforeEach, describe, expect, it } from "vitest";
import { BULK_ACT_ID, HERO_REFUND_ID } from "@/data/mockData";
import { DEMO_STORAGE_KEY, useAppStore } from "@/store/appStore";
import type { ChallengeCase, LegalAct } from "@/types";

const store = () => useAppStore.getState();

interface SavedDemo {
  state: { legalActs: LegalAct[]; challenges: ChallengeCase[] };
}

beforeEach(() => {
  sessionStorage.clear();
  store().resetDemo();
});

describe("demo persistence", () => {
  it("writes demo data to sessionStorage, without actions", () => {
    store().registerLegalAct(BULK_ACT_ID, "Laura Gómez");
    const saved = sessionStorage.getItem(DEMO_STORAGE_KEY) ?? "";
    expect(saved).toContain('"status":"In force"');
    expect(saved).not.toContain("resetDemo");
  });

  it("restores the saved state on rehydrate (a page reload)", async () => {
    store().registerLegalAct(BULK_ACT_ID, "Laura Gómez");
    const saved = sessionStorage.getItem(DEMO_STORAGE_KEY);
    useAppStore.setState({ refunds: [] });
    sessionStorage.setItem(DEMO_STORAGE_KEY, saved ?? "");
    await useAppStore.persist.rehydrate();
    expect(store().refunds.find((r) => r.id === HERO_REFUND_ID)?.status).toBe("Eligible");
  });

  it("clears the saved changes on reset", () => {
    store().registerLegalAct(BULK_ACT_ID, "Laura Gómez");
    store().resetDemo("beforeChallenge");
    const saved: SavedDemo = JSON.parse(sessionStorage.getItem(DEMO_STORAGE_KEY) ?? "{}");
    expect(saved.state.legalActs.find((a) => a.id === BULK_ACT_ID)?.status).toBe("Draft");
    expect(saved.state.challenges.some((c) => c.id === "C-1042")).toBe(false);
  });
});
