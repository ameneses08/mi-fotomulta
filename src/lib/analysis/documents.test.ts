import { describe, expect, it } from "vitest";
import { documentFindings, driverIdentified } from "@/lib/analysis/documents";
import { driverDocuments, makeAnalysisContext, makeChallenge, makeFine } from "@/test/fixtures";

const ctx = makeAnalysisContext();
const fine = makeFine();
const find = (evidence = driverDocuments(), key = "") =>
  documentFindings(makeChallenge({ evidence }), fine, ctx).find((f) => f.id.endsWith(key));

describe("documentFindings", () => {
  it("passes presence, signature, names and licence for a complete driver filing", () => {
    const findings = documentFindings(makeChallenge({ evidence: driverDocuments() }), fine, ctx);
    expect(findings.map((f) => [f.id.split(":")[1], f.result])).toEqual([
      ["documents", "Pass"],
      ["statement", "Pass"],
      ["names", "Pass"],
      ["licence", "Pass"],
      ["R7", "Info"],
    ]);
  });

  it("says the driver can be identified but leaves the merits to a human (R7)", () => {
    const r7 = find(driverDocuments(), "R7");
    expect(r7).toMatchObject({ level: "H", result: "Info" });
    expect(r7?.why).toContain("decision on the merits is human only");
  });

  it("flags missing documents and an unidentified driver", () => {
    const evidence = driverDocuments().slice(0, 1);
    expect(find(evidence, "documents")?.result).toBe("Flag");
    expect(find(evidence, "R7")?.result).toBe("Flag");
  });

  it("flags names that differ between statement and licence", () => {
    expect(find(driverDocuments({ driverOnLicence: "Someone Else" }), "names")?.result).toBe(
      "Flag",
    );
  });

  it("flags a licence that expired before the infraction", () => {
    expect(find(driverDocuments({ licenceUntil: "2026-01-01" }), "licence")?.result).toBe("Flag");
    expect(
      driverIdentified(
        makeChallenge({ evidence: driverDocuments({ licenceUntil: "2026-01-01" }) }),
        fine,
      ),
    ).toBe(false);
  });

  it("cites the source document and page", () => {
    expect(find(driverDocuments(), "statement")?.evidence).toBe("From: Driver statement, p.1");
  });
});
