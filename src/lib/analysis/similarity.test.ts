import { describe, expect, it } from "vitest";
import {
  groupSimilarity,
  hasNewEvidence,
  similarityFindings,
  textSimilarity,
} from "@/lib/analysis/similarity";
import { makeAnalysisContext, makeChallenge } from "@/test/fixtures";

const template = (name: string) =>
  `I, ${name}, request the revocation of the fine because the camera did not have a valid authorisation on the date of the event and fines from unauthorised devices lack legal effect.`;
const poa = { name: "poa.pdf", kind: "Power of attorney" as const };
const a = makeChallenge({
  id: "C-a",
  representative: "Firm",
  request: template("Ana Ruiz"),
  evidence: [poa],
});
const b = makeChallenge({
  id: "C-b",
  fineId: "F-2",
  representative: "Firm",
  request: template("Luis Gil"),
  evidence: [poa],
});
const c = makeChallenge({
  id: "C-c",
  fineId: "F-3",
  representative: "Firm",
  request: template("Eva Paz"),
  evidence: [poa, { name: "cert.pdf", kind: "Calibration certificate" }],
});

describe("textSimilarity", () => {
  it("is 100 for identical text and lower for different text, deterministically", () => {
    expect(textSimilarity("the same words here", "the same words here")).toBe(100);
    expect(textSimilarity("a b c d", "w x y z")).toBe(0);
    expect(textSimilarity(a.request, b.request)).toBe(textSimilarity(a.request, b.request));
  });

  it("scores templated filings in the high nineties", () => {
    const percent = textSimilarity(a.request, b.request);
    expect(percent).toBeGreaterThanOrEqual(90);
    expect(percent).toBeLessThan(100);
  });
});

describe("similarityFindings (R9)", () => {
  const ctx = makeAnalysisContext({ challenges: [a, b, c] });

  it("flags a templated filing with no new evidence", () => {
    const [finding] = similarityFindings(a, ctx);
    expect(finding).toMatchObject({ result: "Flag", category: "Similarity", level: "S" });
    expect(finding?.why).toMatch(/identical to 2 other Firm filings/);
  });

  it("passes a filing that adds new evidence", () => {
    expect(hasNewEvidence(c)).toBe(true);
    expect(similarityFindings(c, ctx)[0]?.why).toContain("calibration certificate");
  });

  it("reports the highest similarity within the group", () => {
    expect(groupSimilarity(a, ctx.challenges).count).toBe(2);
  });

  it("ignores filings without a representative", () => {
    expect(similarityFindings(makeChallenge(), ctx)).toEqual([]);
  });
});
