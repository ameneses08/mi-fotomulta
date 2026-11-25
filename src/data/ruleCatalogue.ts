import type { RuleId, RuleLevel } from "@/types";

export interface RuleDefinition {
  title: string;
  level: RuleLevel;
}

/** Business rules R1–R12. Levels: A automated, S AI-supported + human sign-off, H human only. */
export const RULES: Record<RuleId, RuleDefinition> = {
  R1: { title: "Filed within 11 working days of notification", level: "A" },
  R2: { title: "Fine issued by SDM, not another authority", level: "A" },
  R3: { title: "No duplicate case on the same fine", level: "A" },
  R4: { title: "Camera authorised on the infraction date", level: "A" },
  R5: { title: "Notice sent within 3 working days of validation", level: "A" },
  R6: { title: "Plate in the image matches RUNT", level: "S" },
  R7: { title: "Driver identified by the authority (C-038/2020)", level: "H" },
  R8: { title: "Vehicle sold but not transferred", level: "H" },
  R9: { title: "New evidence, not only templated arguments", level: "S" },
  R10: { title: "Bulk revocation: non-compliant camera and act in force", level: "S" },
  R11: { title: "Refund eligibility: paid, revoked, not yet refunded", level: "A" },
  R12: { title: "Bank account verified in the claimant's name", level: "A" },
};

export const RULE_LEVEL_LABELS: Record<RuleLevel, string> = {
  A: "Automated",
  S: "AI-supported",
  H: "Human only",
};
