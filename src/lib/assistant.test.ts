import { describe, expect, it } from "vitest";
import { answerQuestion, fineIdIn, matchIntent, type AssistantContext } from "@/lib/assistant";
import {
  BULK_ACT_ID,
  cameras,
  challenges,
  citizen,
  fines,
  heroChallenge,
  legalActs,
  refunds,
} from "@/data/mockData";
import { assistantScripts } from "@/data/aiScripts";
import type { LegalAct } from "@/types";

const base: AssistantContext = {
  rules: { fines, cameras, legalActs, challenges, refunds },
  citizen,
  today: "2026-11-25",
};
const withAct: AssistantContext = {
  ...base,
  rules: {
    ...base.rules,
    legalActs: legalActs.map((a): LegalAct =>
      a.id === BULK_ACT_ID ? { ...a, status: "In force" } : a,
    ),
  },
};
const ask = (question: string, ctx = base) => {
  const intent = matchIntent(question);
  if (!intent) throw new Error(`No intent for ${question}`);
  return answerQuestion(intent, question, ctx);
};

describe("matchIntent", () => {
  it("maps each suggested chip to its intent", () => {
    for (const chip of assistantScripts.chips) expect(matchIntent(chip.question)).toBe(chip.intent);
  });

  it("matches free typing by keywords", () => {
    expect(matchIntent("what's my deadline?")).toBe("challengeDeadline");
    expect(matchIntent("money back please")).toBe("refundTiming");
  });

  it("returns null for unsupported questions", () => {
    expect(matchIntent("What's the weather like?")).toBeNull();
  });

  it("reads a fine id from the question", () => {
    expect(fineIdIn("how long for f2043?", "F-2041")).toBe("F-2043");
    expect(fineIdIn("how long?", "F-2041")).toBe("F-2041");
  });
});

describe("answerQuestion", () => {
  it("summarises all six fines with the open challenge's holder and date", () => {
    const { text, action } = ask("Give me a status check of my fotomultas");
    expect(text).toBe(
      "You have 6 fines: 1 to pay, 1 with a challenge in progress (being checked by Inspector Laura Gómez, expected by 04 Dec 2026), 1 under review because the camera wasn't authorised, 1 refund on hold, 1 paid and 1 from another authority.",
    );
    expect(action).toMatchObject({ target: "case", id: "C-1042" });
  });

  it("updates the status check after the legal act is in force", () => {
    expect(ask("status check", withAct).text).toContain("2 revoked");
  });

  it("gives the challenge deadline in working days when no challenge exists", () => {
    const ctx = {
      ...base,
      rules: { ...base.rules, challenges: challenges.filter((c) => c.id !== heroChallenge.id) },
    };
    const answer = ask("How long do I have to challenge F-2041?", ctx);
    expect(answer.text).toContain("until 30 Nov 2026");
    expect(answer.text).toContain("3 working days left");
    expect(answer.humanExit).toBe(true);
  });

  it("says the fine is already challenged when it is", () => {
    expect(ask("How long do I have to challenge F-2041?").text).toContain(
      "already challenged F-2041",
    );
  });

  it("explains F-2042 by camera, then by the act once revoked", () => {
    expect(ask("Why is F-2042 under review?").text).toContain(
      "camera CAM-NQS13 was not authorised",
    );
    expect(ask("Why is F-2042 under review?", withAct).text).toContain("revoked by Resolution");
  });

  it("follows the refund status", () => {
    expect(ask("When will I get my refund?").text).toContain("on hold");
    expect(
      ask("When will I get my refund?", {
        ...withAct,
        rules: {
          ...withAct.rules,
          refunds: refunds.map((r) =>
            r.id === "R-1044" ? { ...r, status: "Eligible" as const } : r,
          ),
        },
      }).text,
    ).toContain("is ready");
  });
});
