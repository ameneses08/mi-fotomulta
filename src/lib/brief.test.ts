import { describe, expect, it } from "vitest";
import { caseBriefFor, draftCitizenMessage } from "@/lib/brief";
import { makeChallenge } from "@/test/fixtures";

describe("caseBriefFor", () => {
  it("uses the case-specific script for the hero case", () => {
    expect(caseBriefFor(makeChallenge({ id: "C-1042" })).suggestion).toBe("Revoke");
  });

  it("falls back to the script for the reason", () => {
    const brief = caseBriefFor(makeChallenge({ id: "C-9", reason: "Wrong plate" }));
    expect(brief.reliedOn).toEqual(["R6"]);
  });
});

describe("draftCitizenMessage", () => {
  it("addresses the citizen by first name and names the fine", () => {
    const message = draftCitizenMessage(
      "Revoke",
      makeChallenge({ citizenName: "Marta Rodríguez" }),
    );
    expect(message).toMatch(/^Dear Marta, .*fine F-1/);
  });
});
