import { describe, expect, it } from "vitest";
import { fraudFindings, refundFraudFindings } from "@/lib/analysis/fraud";
import { makeAnalysisContext, makeChallenge, makeRefund } from "@/test/fixtures";
import type { BankAccount } from "@/types";

const ctx = makeAnalysisContext();
const resultOf = (findings: ReturnType<typeof fraudFindings>, key: string) =>
  findings.find((f) => f.id.endsWith(key))?.result;

describe("fraudFindings", () => {
  it("flags a duplicate case on the same fine (R3)", () => {
    const first = makeChallenge();
    const ctx2 = makeAnalysisContext({ challenges: [first, makeChallenge({ id: "C-2" })] });
    expect(resultOf(fraudFindings(first, ctx2), "R3")).toBe("Flag");
    expect(resultOf(fraudFindings(first, ctx), "R3")).toBe("Pass");
  });

  it("flags a photo edited after capture, without rejecting the case", () => {
    const challenge = makeChallenge({
      evidence: [
        {
          name: "photo.jpg",
          kind: "Photo",
          metadata: {
            capturedAt: "2026-11-01T10:00:00Z",
            modifiedAt: "2026-11-03T18:00:00Z",
            software: "PhotoEdit Pro",
          },
        },
      ],
    });
    const finding = fraudFindings(challenge, ctx).find((f) => f.id.endsWith("image-0"));
    expect(finding).toMatchObject({ result: "Flag", confidence: "Medium" });
    expect(finding?.why).toContain("never an automatic rejection");
    expect(challenge.status).toBe("Validating");
  });

  it("flags an expired power of attorney", () => {
    const challenge = makeChallenge({
      submittedOn: "2026-11-16",
      evidence: [
        {
          name: "poa.pdf",
          kind: "Power of attorney",
          extracted: [{ name: "Expires", value: "2026-10-31", page: 1 }],
        },
      ],
    });
    expect(resultOf(fraudFindings(challenge, ctx), "poa")).toBe("Flag");
  });
});

describe("refundFraudFindings", () => {
  const account = (last4: string, holderDocument = "1"): BankAccount => ({
    bank: "B",
    type: "Savings",
    last4,
    holderName: "Holder",
    holderDocument,
  });

  it("flags a holder who is not the claimant (R12)", () => {
    const refund = makeRefund({ bankAccount: account("1111", "999") });
    const findings = refundFraudFindings(refund, makeAnalysisContext({ refunds: [refund] }));
    expect(findings.find((f) => f.id.endsWith("holder"))?.why).toMatch(
      /doesn't match the claimant/,
    );
  });

  it("flags only the later of two claims on one fine", () => {
    const a = makeRefund({ id: "R-a", requestedOn: "2026-11-01" });
    const b = makeRefund({ id: "R-b", requestedOn: "2026-11-20" });
    const ctx2 = makeAnalysisContext({ refunds: [a, b] });
    expect(resultOf(refundFraudFindings(a, ctx2), "duplicate-claim")).toBe("Pass");
    expect(
      refundFraudFindings(b, ctx2).find((f) => f.id.endsWith("duplicate-claim"))?.why,
    ).toContain("already claimed in R-a");
  });

  it("flags one account receiving refunds from three claimants", () => {
    const shared = ["1", "2", "3"].map((doc) =>
      makeRefund({
        id: `R-${doc}`,
        fineId: `F-${doc}`,
        claimantDocument: doc,
        bankAccount: account("7730", doc),
      }),
    );
    const finding = refundFraudFindings(shared[0]!, makeAnalysisContext({ refunds: shared })).find(
      (f) => f.id.endsWith("account-reuse"),
    );
    expect(finding?.why).toBe("Account ending 7730 receives 3 refunds from different claimants.");
  });
});
