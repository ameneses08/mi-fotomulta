import { allowedNextStatuses } from "@/lib/transitions";
import type { ChallengeCase, Fine, FineStatus, RefundCase } from "@/types";

export type FineAction = "track" | "appeal" | "refund" | "challenge" | "pay";

/**
 * Which buttons a fine shows. While a challenge is open (any status before Closed) the citizen
 * can only track it – never file a second one (R3). After a decision, Appeal appears when the
 * status model allows it.
 */
export function fineActions(
  fine: Fine,
  status: FineStatus,
  challenge: ChallengeCase | undefined,
  refund: RefundCase | undefined,
): FineAction[] {
  if (status === "Another authority") return [];
  const unpaid = !fine.paidOn && status !== "Revoked";
  if (challenge) {
    const actions: FineAction[] = ["track"];
    if (allowedNextStatuses(challenge).includes("Appealed")) actions.push("appeal");
    const decided = challenge.status === "Decided" || challenge.status === "Closed";
    if (decided && refund) actions.push("refund");
    if (decided && unpaid) actions.push("pay");
    return actions;
  }
  const actions: FineAction[] = refund ? ["refund"] : [];
  return unpaid ? [...actions, "challenge", "pay"] : actions;
}

/** A new challenge can only be filed when the fine has none (R3). */
export function canStartChallenge(fineId: string, challenges: readonly ChallengeCase[]): boolean {
  return !challenges.some((c) => c.fineId === fineId);
}
