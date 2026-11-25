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

export type AiResponse = "accepted" | "overridden" | "ignored";

const AI_RESPONSE_ACTIONS: Record<AiResponse, string> = {
  accepted: "AI suggestion accepted",
  overridden: "AI suggestion overridden",
  ignored: "AI suggestion not followed",
};

/**
 * Accepted: the inspector took the suggestion. Overridden: a different final outcome.
 * Ignored: the inspector chose a procedural step (correction, hearing) instead.
 */
export function aiResponseFor(kind: DecisionKind, suggestion: DecisionKind): AiResponse {
  if (kind === suggestion) return "accepted";
  return OUTCOMES[kind] ? "overridden" : "ignored";
}

/** Decisions the inspector may take from the current status (follows the transition table). */
export function availableDecisions(status: ChallengeStatus): DecisionKind[] {
  if (status === "Validating") return ALL_DECISIONS;
  if (status === "Hearing scheduled") return ["Revoke", "Uphold", "Partly uphold"];
  return [];
}

/** Message templates add their own full stop after a placeholder. */
function withoutFinalStop(text: string): string {
  return text.trim().replace(/[.\s]+$/, "");
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
      values: { outcome, plain_reason: withoutFinalStop(input.reason), ...datedValues(appealBy) },
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
    values: { what: withoutFinalStop(input.reason), ...datedValues(correctBy) },
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
  const response = aiResponseFor(input.kind, input.aiSuggestion);
  const entry = (actor: string, action: string, reason: string) =>
    createAuditEntry({ caseId: challenge.id, actor, action, reason, timestamp: input.timestamp });
  return {
    ok: true,
    entity,
    audit: [
      result.audit,
      entry(
        input.inspector,
        AI_RESPONSE_ACTIONS[response],
        `AI suggested "${input.aiSuggestion}"; inspector chose "${input.kind}".`,
      ),
      entry(
        "AI assistant",
        "Citizen message drafted",
        "Draft built from the inspector's reason (level S).",
      ),
      entry(input.inspector, "Citizen message approved and sent", input.citizenMessage.trim()),
    ],
  };
}
