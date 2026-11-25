import { describe, expect, it } from "vitest";
import { refundRegistryFindings, registryFindings } from "@/lib/analysis/registry";
import {
  makeAct,
  makeAnalysisContext,
  makeChallenge,
  makeFine,
  makeRefund,
  unauthorisedCamera,
} from "@/test/fixtures";

const ctx = makeAnalysisContext();
const result = (findings: ReturnType<typeof registryFindings>, rule: string) =>
  findings.find((f) => f.ruleId === rule)?.result;

describe("registryFindings", () => {
  it("checks the camera authorisation (R4) and the plate (R6)", () => {
    const ok = registryFindings(makeChallenge(), makeFine(), ctx);
    expect(result(ok, "R4")).toBe("Pass");
    expect(result(ok, "R6")).toBe("Pass");
    const bad = registryFindings(
      makeChallenge(),
      makeFine({ cameraId: unauthorisedCamera.id, imagePlate: "AAA117" }),
      ctx,
    );
    // An unauthorised camera supports the challenge: information, not a flag.
    expect(result(bad, "R4")).toBe("Info");
    expect(result(bad, "R6")).toBe("Flag");
  });

  it("applies the bulk act only while it is in force (R10)", () => {
    const fine = makeFine({ cameraId: unauthorisedCamera.id });
    expect(result(registryFindings(makeChallenge(), fine, ctx), "R10")).toBe("Info");
    const inForce = { ...ctx, legalActs: [makeAct({ status: "In force" })] };
    expect(result(registryFindings(makeChallenge(), fine, inForce), "R10")).toBe("Pass");
  });

  it("flags a sale before the infraction with RUNT owner unchanged (R8)", () => {
    const challenge = makeChallenge({
      reason: "Vehicle sold before the fine",
      evidence: [
        {
          name: "bill.pdf",
          kind: "Bill of sale",
          extracted: [
            { name: "Date of sale", value: "2026-10-02", page: 1 },
            { name: "Seller", value: "Test Owner", page: 1 },
          ],
        },
      ],
    });
    const r8 = registryFindings(challenge, makeFine(), ctx).find((f) => f.ruleId === "R8");
    expect(r8).toMatchObject({ result: "Flag", level: "H" });
  });
});

describe("refundRegistryFindings", () => {
  it("does not mark a paid refund ineligible because of its own payment", () => {
    const fine = makeFine({ cameraId: unauthorisedCamera.id, paidOn: "2026-11-01" });
    const paid = makeRefund({ status: "Paid" });
    const inForce = { ...ctx, legalActs: [makeAct({ status: "In force" })], refunds: [paid] };
    expect(refundRegistryFindings(paid, fine, inForce)[0]?.result).toBe("Pass");
  });

  it("checks eligibility (R11) and the approval threshold", () => {
    const fine = makeFine({ cameraId: unauthorisedCamera.id, paidOn: "2026-11-01" });
    const inForce = { ...ctx, legalActs: [makeAct({ status: "In force" })] };
    const [r11, threshold] = refundRegistryFindings(
      makeRefund({ amount: 1_250_000 }),
      fine,
      inForce,
    );
    expect(r11?.result).toBe("Pass");
    expect(threshold).toMatchObject({ result: "Flag", level: "H" });
  });
});
