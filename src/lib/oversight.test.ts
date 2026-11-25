import { describe, expect, it } from "vitest";
import { computeOversight } from "@/lib/oversight";
import { createAuditEntry } from "@/lib/transitions";

const entry = (caseId: string, actor: string, action: string, reason: string, timestamp: string) =>
  createAuditEntry({ caseId, actor, action, reason, timestamp });

const audit = [
  entry("C-1", "Laura", "Status changed", "Driver identified", "t1"),
  entry("C-1", "Laura", "AI suggestion accepted", "", "t1"),
  entry("C-2", "Laura", "Status changed", "Wrong amount band", "t2"),
  entry("C-2", "Laura", "AI suggestion overridden", "AI suggested Uphold", "t2"),
  entry("C-3", "Laura", "AI suggestion not followed", "", "t3"),
  entry("C-1", "AI assistant", "Citizen message drafted", "", "t1"),
  entry("C-4", "Laura", "AI flag confirmed", "R1", "t4"),
  entry("C-4", "Laura", "AI flag confirmed", "R6", "t5"),
  entry("C-5", "Laura", "AI flag dismissed as false positive", "Names: same person", "t6"),
];

describe("computeOversight", () => {
  const stats = computeOversight(audit, 12);

  it("counts accepted, overridden and not-followed suggestions", () => {
    expect(stats).toMatchObject({ accepted: 1, overridden: 1, notFollowed: 1 });
  });

  it("lists override reasons from the matching decision", () => {
    expect(stats.overrideReasons).toEqual([{ caseId: "C-2", reason: "Wrong amount band" }]);
  });

  it("computes the false-positive rate of reviewed flags", () => {
    expect(stats).toMatchObject({ confirmed: 2, dismissed: 1 });
    expect(stats.falsePositiveRate).toBeCloseTo(1 / 3);
    expect(stats.dismissReasons).toEqual([{ caseId: "C-5", reason: "Names: same person" }]);
  });

  it("estimates reading time saved at 4 minutes per summarised filing", () => {
    expect(stats.minutesSaved).toBe(48);
  });

  it("counts actions taken by the AI assistant", () => {
    expect(stats.aiActions).toBe(1);
  });

  it("has no false-positive rate before any review", () => {
    expect(computeOversight([], 0).falsePositiveRate).toBeNull();
  });
});
