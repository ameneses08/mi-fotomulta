import { aiScripts } from "@/data/aiScripts";
import { fillTemplate, formatDate } from "@/lib/format";
import { changeStatus, createAuditEntry } from "@/lib/transitions";
import type {
  AuditEntry,
  ChallengeCase,
  ChallengeReason,
  Citizen,
  EvidenceItem,
  Fine,
  IsoDate,
  IsoTimestamp,
} from "@/types";

export const MAX_FACT_LENGTH = 500;
export const CHALLENGE_STEPS = ["Reason", "Facts", "Evidence", "Review"] as const;

export interface ChallengeDraft {
  fineId: string;
  step: number;
  reason: ChallengeReason | "";
  facts: string[];
  pastedText: string;
  evidence: EvidenceItem[];
  request: string;
}

export function emptyDraft(fineId: string): ChallengeDraft {
  return {
    fineId,
    step: 0,
    reason: "",
    facts: ["", "", ""],
    pastedText: "",
    evidence: [],
    request: "",
  };
}

/** Returns an error message, or null when the step can be completed. */
export function validateStep(draft: ChallengeDraft): string | null {
  if (draft.step === 0 && !draft.reason) return "Choose a reason to continue.";
  if (draft.step === 1 && draft.facts.some((fact) => !fact.trim())) {
    return "Answer all three questions to continue.";
  }
  if (draft.step === 3 && !draft.request.trim()) return "Your request cannot be empty.";
  return null;
}

export function clampFact(value: string): string {
  return value.slice(0, MAX_FACT_LENGTH);
}

export function guessEvidenceKind(fileName: string): EvidenceItem["kind"] {
  const name = fileName.toLowerCase();
  if (/(cedula|c[eé]dula|id[-_ ]|identity)/.test(name)) return "ID copy";
  if (/(statement|declaraci)/.test(name)) return "Driver statement";
  if (/(sale|contract|venta)/.test(name)) return "Bill of sale";
  if (/\.(jpe?g|png)$/.test(name)) return "Photo";
  return "Other";
}

export function draftRequest(draft: ChallengeDraft, fine: Fine, citizen: Citizen): string {
  return fillTemplate(aiScripts.requestTemplate, {
    citizen_name: citizen.name,
    fine_id: fine.id,
    plate: fine.plate,
    date: formatDate(fine.infractionDate),
    location: fine.location,
    reason: draft.reason,
    facts: draft.facts.map((fact) => fact.trim()).join("\n\n"),
  });
}

/** C-1042 for the hero fine, otherwise a case id derived from the fine id. */
export function caseIdForFine(fineId: string, heroFineId: string, heroCaseId: string): string {
  return fineId === heroFineId ? heroCaseId : `C-${fineId.replace(/\D/g, "")}`;
}

export interface Submission {
  challenge: ChallengeCase;
  audit: AuditEntry[];
}

/** A new submission always starts at Received, replacing any earlier record with the same id. */
export function submitDraft(
  draft: ChallengeDraft,
  caseId: string,
  citizen: Citizen,
  today: IsoDate,
  timestamp: IsoTimestamp,
): Submission | { error: string } {
  if (!draft.reason) return { error: "Choose a reason to continue." };
  if (!draft.request.trim()) return { error: "Your request cannot be empty." };
  const challenge: ChallengeCase = {
    kind: "challenge",
    id: caseId,
    fineId: draft.fineId,
    citizenName: citizen.name,
    citizenDocument: citizen.document,
    reason: draft.reason,
    submittedOn: today,
    status: "Received",
    hadHearing: false,
    holder: "Automatic checks",
    facts: draft.facts.map((fact) => fact.trim()),
    request: draft.request.trim(),
    evidence: draft.evidence,
    messageValues: {},
  };
  const entry = createAuditEntry({
    caseId,
    actor: citizen.name,
    action: "Challenge submitted",
    to: "Received",
    reason: "Filed online through Mi Fotomulta Clara",
    timestamp,
  });
  return { challenge, audit: [entry] };
}

/** Simulated automatic checks finishing: Received → Validating, assigned to an inspector. */
export function completeAutomaticChecks(
  challenge: ChallengeCase,
  inspectorLabel: string,
  timestamp: IsoTimestamp,
): { ok: true; challenge: ChallengeCase; audit: AuditEntry[] } | { ok: false; error: string } {
  const result = changeStatus(
    challenge,
    "Validating",
    "System",
    "Automatic checks R1, R3, R4, R5 completed",
    {
      timestamp,
    },
  );
  if (!result.ok) return result;
  const assigned = createAuditEntry({
    caseId: challenge.id,
    actor: "System",
    action: "Case assigned",
    reason: `Assigned to ${inspectorLabel}`,
    timestamp,
  });
  return {
    ok: true,
    challenge: { ...result.entity, holder: inspectorLabel },
    audit: [result.audit, assigned],
  };
}
