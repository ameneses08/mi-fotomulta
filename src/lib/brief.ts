import { aiScripts, type CaseBrief } from "@/data/aiScripts";
import { fillTemplate } from "@/lib/format";
import type { ChallengeCase, DecisionKind } from "@/types";

/** The scripted AI brief for a case: a case-specific script if one exists, else by reason. */
export function caseBriefFor(challenge: ChallengeCase): CaseBrief {
  return aiScripts.caseBriefs[challenge.id] ?? aiScripts.briefsByReason[challenge.reason];
}

/** AI draft (level S) built from the inspector's actual reason; the inspector approves it. */
export function draftCitizenMessage(
  kind: DecisionKind,
  challenge: ChallengeCase,
  reason: string,
): string {
  const firstName = challenge.citizenName.split(" ")[0] ?? challenge.citizenName;
  const plainReason = reason.trim().replace(/[.\s]+$/, "");
  return fillTemplate(aiScripts.citizenMessageDrafts[kind], {
    first_name: firstName,
    fine_id: challenge.fineId,
    reason: plainReason
      ? plainReason.charAt(0).toLowerCase() + plainReason.slice(1)
      : "[your reason]",
  });
}
