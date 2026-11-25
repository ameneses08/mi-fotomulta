import type { RuleId, RuleLevel } from "@/types";

export interface RuleDefinition {
  /** Plain-language label shown next to the code everywhere it appears. */
  label: string;
  /** The rule in one sentence, shown in the tooltip. */
  rule: string;
  level: RuleLevel;
}

/** Business rules R1–R12. Levels: A automated, S AI-supported + human sign-off, H human only. */
export const RULES: Record<RuleId, RuleDefinition> = {
  R1: {
    label: "Filing deadline",
    rule: "A challenge must be filed within 11 working days of the notification.",
    level: "A",
  },
  R2: {
    label: "Other authority's camera",
    rule: "Fines issued by another authority are not handled by the SDM.",
    level: "A",
  },
  R3: {
    label: "Duplicate case",
    rule: "A fine can have only one open challenge at a time.",
    level: "A",
  },
  R4: {
    label: "Camera authorisation",
    rule: "The camera must have been authorised by the national road-safety agency on the infraction date.",
    level: "A",
  },
  R5: {
    label: "Notice sent on time",
    rule: "The notice must be sent within 3 working days of validating the infraction (Ley 1843 de 2017, art. 8).",
    level: "A",
  },
  R6: {
    label: "Plate vs register",
    rule: "The plate read from the photo must match the vehicle in the RUNT register.",
    level: "S",
  },
  R7: {
    label: "Not the driver",
    rule: "The owner is liable only if the authority identified the driver (Constitutional Court C-038/2020).",
    level: "H",
  },
  R8: {
    label: "Sold, not transferred",
    rule: "A vehicle sold before the infraction but not transferred in RUNT needs a person to weigh the evidence.",
    level: "H",
  },
  R9: {
    label: "New evidence vs template",
    rule: "Templated filings are grouped, but each one is decided on its own evidence.",
    level: "S",
  },
  R10: {
    label: "Bulk revocation",
    rule: "Fines from a non-compliant camera are revoked together once a legal act is in force.",
    level: "S",
  },
  R11: {
    label: "Refund eligibility",
    rule: "A refund is due when the fine was paid, then revoked, and not yet refunded.",
    level: "A",
  },
  R12: {
    label: "Refund payment check",
    rule: "The bank account must be in the claimant's name; large or mismatched refunds need a person.",
    level: "A",
  },
};

export const RULE_LEVEL_LABELS: Record<RuleLevel, string> = {
  A: "Automated",
  S: "AI-supported",
  H: "Human only",
};
