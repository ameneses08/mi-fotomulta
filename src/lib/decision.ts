import { formatDate } from "@/lib/format";
import { addWorkingDays, SLA_CONFIG } from "@/lib/sla";
import { changeStatus, createAuditEntry } from "@/lib/transitions";
import type {
  AuditEntry,
  ChallengeCase,
  ChallengeStatus,
  DecisionKind,
  DecisionOutcome,
  IsoDate,
  IsoTimestamp,
  MessageValues,
} from "@/types";

export interface DecisionInput {
  kind: DecisionKind;
  reason: string;
  citizenMessage: string;
  inspector: string;
  aiSuggestion: DecisionKind;
  today: IsoDate;
  timestamp: IsoTimestamp;
}

export type DecisionResult =
  { ok: true; entity: ChallengeCase; audit: AuditEntry[] } | { ok: false; error: string };

const OUTCOMES: Partial<Record<DecisionKind, DecisionOutcome>> = {
  Revoke: "Revoked",
  Uphold: "Upheld",
  "Partly uphold": "Partly upheld",
};

const ALL_DECISIONS: DecisionKind[] = [
  "Revoke",
  "Uphold",
  "Partly uphold",
  "Schedule hearing",
  "Request correction",
];

/** Decisions the inspector may take from the current status (follows the transition table). */
export function availableDecisions(status: ChallengeStatus): DecisionKind[] {
  if (status === "Validating") return ALL_DECISIONS;
  if (status === "Hearing scheduled") return ["Revoke", "Uphold", "Partly uphold"];
  return [];
}

function datedValues(date: IsoDate): MessageValues {
  return { date: formatDate(date), dateIso: date };
}

function targetFor(input: DecisionInput): { status: ChallengeStatus; values: MessageValues } {
  const outcome = OUTCOMES[input.kind];
  if (outcome) {
    const appealBy = addWorkingDays(input.today, SLA_CONFIG.appealDays);
    return {
      status: "Decided",
      values: { outcome, plain_reason: input.reason.trim(), ...datedValues(appealBy) },
    };
  }
  if (input.kind === "Schedule hearing") {
    const hearingOn = addWorkingDays(input.today, SLA_CONFIG.hearingNoticeDays);
    return {
      status: "Hearing scheduled",
      values: {
        ...datedValues(hearingOn),
        time: "09:30",
        virtual_link_or_address: "virtual hearing (link sent by email)",
      },
    };
  }
  const correctBy = addWorkingDays(input.today, SLA_CONFIG.correctionDays);
  return {
    status: "Needs correction",
    values: { what: input.reason.trim(), ...datedValues(correctBy) },
  };
}

/**
 * Applies an inspector decision: one status change through changeStatus, plus an audit entry
 * recording whether the AI suggestion was accepted or overridden.
 */
export function applyDecision(challenge: ChallengeCase, input: DecisionInput): DecisionResult {
  if (!availableDecisions(challenge.status).includes(input.kind)) {
    return {
      ok: false,
      error: `"${input.kind}" is not available while the case is ${challenge.status}.`,
    };
  }
  if (!input.reason.trim()) return { ok: false, error: "Write the reason for your decision." };
  if (!input.citizenMessage.trim())
    return { ok: false, error: "The message to the citizen cannot be empty." };

  const target = targetFor(input);
  const result = changeStatus(challenge, target.status, input.inspector, input.reason.trim(), {
    timestamp: input.timestamp,
    messageValues: target.values,
  });
  if (!result.ok) return result;

  const outcome = OUTCOMES[input.kind];
  const entity: ChallengeCase = {
    ...result.entity,
    citizenNote: input.citizenMessage.trim(),
    hadHearing: challenge.hadHearing || input.kind === "Schedule hearing",
    ...(outcome ? { outcome } : {}),
  };
  const accepted = input.kind === input.aiSuggestion;
  const aiEntry = createAuditEntry({
    caseId: challenge.id,
    actor: input.inspector,
    action: accepted ? "AI suggestion accepted" : "AI suggestion overridden",
    reason: `AI suggested "${input.aiSuggestion}"; inspector chose "${input.kind}".`,
    timestamp: input.timestamp,
  });
  return { ok: true, entity, audit: [result.audit, aiEntry] };
}
