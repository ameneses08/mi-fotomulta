import { analysisScripts as T } from "@/data/aiScripts";
import { fillTemplate } from "@/lib/format";
import type { AnalysisFinding, ChallengeCase } from "@/types";
import { makeFinding, type AnalysisContext } from "./finding";

const words = (text: string) => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];

/** Deterministic text similarity: Dice coefficient over word bigrams, as a whole percentage. */
export function textSimilarity(a: string, b: string): number {
  const bigrams = (text: string) => {
    const tokens = words(text);
    const counts = new Map<string, number>();
    for (let i = 0; i < tokens.length - 1; i += 1) {
      const key = `${tokens[i]} ${tokens[i + 1]}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  };
  const first = bigrams(a);
  const second = bigrams(b);
  let shared = 0;
  first.forEach((count, key) => (shared += Math.min(count, second.get(key) ?? 0)));
  const total = [...first.values(), ...second.values()].reduce((sum, n) => sum + n, 0);
  return total ? Math.round((200 * shared) / total) : 0;
}

/** Evidence beyond a representative's power of attorney counts as new (R9). */
export function newEvidenceOf(challenge: ChallengeCase) {
  return challenge.evidence.filter(
    (item) => item.kind !== "Power of attorney" && item.kind !== "Other",
  );
}

export function hasNewEvidence(challenge: ChallengeCase): boolean {
  return newEvidenceOf(challenge).length > 0;
}

/** Highest similarity between this filing and the other filings by the same representative. */
export function groupSimilarity(
  challenge: ChallengeCase,
  all: readonly ChallengeCase[],
): { percent: number; count: number } {
  const peers = all.filter(
    (c) =>
      c.id !== challenge.id && c.representative && c.representative === challenge.representative,
  );
  const percent = Math.max(
    0,
    ...peers.map((peer) => textSimilarity(challenge.request, peer.request)),
  );
  return { percent, count: peers.length };
}

/** R9: near-identical filings from one representative, and whether this one adds new evidence. */
export function similarityFindings(
  challenge: ChallengeCase,
  ctx: AnalysisContext,
): AnalysisFinding[] {
  if (!challenge.representative) return [];
  const { percent, count } = groupSimilarity(challenge, ctx.challenges);
  const added = newEvidenceOf(challenge)[0];
  return [
    makeFinding(
      "R9",
      {
        caseId: challenge.id,
        category: "Similarity",
        check: T.checks.similarity,
        // Similarity alone is an overview fact, not a problem: each case is still read in full.
        result: added ? "Pass" : "Info",
        evidence: added ? `From: ${added.kind}` : "From: filing text compared with the group",
        confidence: "High",
        level: "S",
        ruleId: "R9",
        why: fillTemplate(added ? T.why.similarityPass : T.why.similarityFlag, {
          percent: String(percent),
          count: String(count),
          representative: challenge.representative,
          document: added?.kind.toLowerCase() ?? "",
        }),
      },
      ctx,
    ),
  ];
}
