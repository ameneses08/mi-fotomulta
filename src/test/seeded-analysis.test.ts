import { beforeAll, describe, expect, it } from "vitest";
import { analyseCase, analyseRefund } from "@/lib/analysis";
import { analysisContextOf, useAppStore } from "@/store/appStore";
import type { AnalysisContext } from "@/lib/analysis";

let ctx: AnalysisContext;
beforeAll(() => {
  useAppStore.getState().resetDemo();
  ctx = analysisContextOf(useAppStore.getState());
});
const finding = (caseId: string, key: string) =>
  analyseCase(caseId, ctx)?.findings.find((f) => f.id === `${caseId}:${key}`);
const refundFinding = (refundId: string, key: string) =>
  analyseRefund(refundId, ctx)?.findings.find((f) => f.id === `${refundId}:${key}`);

describe("seeded evidence produces the scripted findings", () => {
  it("C-1042: on time, statement signed, names consistent, licence valid, driver identified (H)", () => {
    expect(
      ["R1", "statement", "names", "licence"].map((k) => finding("C-1042", k)?.result),
    ).toEqual(["Pass", "Pass", "Pass", "Pass"]);
    expect(finding("C-1042", "R7")).toMatchObject({ result: "Info", level: "H" });
    expect(finding("C-1042", "R7")?.why).toContain("Andrés Rodríguez Peña");
  });

  it("C-1048: notice sent 6 working days after the infraction (R5)", () => {
    expect(finding("C-1048", "R5")?.why).toContain("6 working days");
  });

  it("C-1053: sold before the infraction, RUNT owner unchanged (R8)", () => {
    expect(finding("C-1053", "R8")).toMatchObject({ result: "Flag", level: "H" });
  });

  it("LegalRápido: 96–99% similar; C-1046 has new evidence; C-1044 has an expired power of attorney", () => {
    const percent = Number(finding("C-1043", "R9")?.why.match(/^(\d+)%/)?.[1]);
    expect(percent).toBeGreaterThanOrEqual(96);
    expect(percent).toBeLessThanOrEqual(99);
    expect(finding("C-1046", "R9")?.result).toBe("Pass");
    expect(finding("C-1046", "R9")?.why).toContain("calibration certificate");
    expect(finding("C-1044", "poa")?.result).toBe("Flag");
    expect(ctx.challenges.find((c) => c.id === "C-1044")?.status).toBe("Needs correction");
  });

  it("C-1049: photo edited after capture is flagged, never rejected", () => {
    expect(finding("C-1049", "image-0")?.result).toBe("Flag");
    expect(ctx.challenges.find((c) => c.id === "C-1049")?.status).toBe("Validating");
  });

  it("refunds keep their flags: holder mismatch, later duplicate claim, shared account", () => {
    expect(refundFinding("R-1047", "holder")?.result).toBe("Flag");
    expect(refundFinding("R-1051", "duplicate-claim")?.result).toBe("Flag");
    expect(refundFinding("R-1052", "account-reuse")?.result).toBe("Flag");
    expect(refundFinding("R-1049", "duplicate-claim")?.result).toBe("Pass");
  });
});
