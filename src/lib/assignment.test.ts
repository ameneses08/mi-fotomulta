import { describe, expect, it } from "vitest";
import { assignCase } from "@/lib/assignment";
import { makeChallenge } from "@/test/fixtures";

describe("assignCase", () => {
  it("changes the holder, keeps the status and writes an audit entry", () => {
    const result = assignCase(
      makeChallenge(),
      "Andrés Ruiz",
      "Laura Gómez",
      "2026-11-25T10:00:00Z",
    );
    expect(result?.challenge).toMatchObject({
      holder: "Inspector Andrés Ruiz",
      status: "Validating",
    });
    expect(result?.audit).toMatchObject({ actor: "Laura Gómez", action: "Case assigned" });
  });

  it("does nothing when the case already has that holder", () => {
    const challenge = makeChallenge({ holder: "Inspector Laura Gómez" });
    expect(assignCase(challenge, "Laura Gómez", "Laura Gómez", "2026-11-25T10:00:00Z")).toBeNull();
  });
});
