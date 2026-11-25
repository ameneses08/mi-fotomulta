import { aiScripts, type CaseBrief } from "@/data/aiScripts";
import { fillTemplate } from "@/lib/format";
import type { ChallengeCase, DecisionKind } from "@/types";

/** The scripted AI brief for a case: a case-specific script if one exists, else by reason. */
export function caseBriefFor(challenge: ChallengeCase): CaseBrief {
  return aiScripts.caseBriefs[challenge.id] ?? aiScripts.briefsByReason[challenge.reason];
}

export function draftCitizenMessage(kind: DecisionKind, challenge: ChallengeCase): string {
  const firstName = challenge.citizenName.split(" ")[0] ?? challenge.citizenName;
  return fillTemplate(aiScripts.citizenMessageDrafts[kind], {
    first_name: firstName,
    fine_id: challenge.fineId,
  });
}
