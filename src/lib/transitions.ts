import type {
  Actor,
  AuditEntry,
  CaseEntity,
  ChallengeCase,
  ChallengeStatus,
  IsoTimestamp,
  MessageValues,
  RefundCase,
  RefundStatus,
} from "@/types";

export const CHALLENGE_TRANSITIONS: Record<ChallengeStatus, readonly ChallengeStatus[]> = {
  Received: ["Validating"],
  Validating: ["Needs correction", "Hearing scheduled", "Decided"],
  "Needs correction": ["Validating", "Closed"],
  "Hearing scheduled": ["Decided", "Closed"],
  Decided: ["Appealed", "Closed"],
  Appealed: ["Decided"],
  Closed: [],
};

export const REFUND_TRANSITIONS: Record<RefundStatus, readonly RefundStatus[]> = {
  Eligible: ["Verifying payment details"],
  "On hold": ["Eligible", "Rejected"],
  "Verifying payment details": ["Approved", "Needs correction", "Rejected"],
  "Needs correction": ["Verifying payment details"],
  Approved: ["Paid"],
  Paid: [],
  Rejected: ["Appealed"],
  Appealed: ["Approved", "Rejected"],
};

export interface ChangeOptions {
  timestamp: IsoTimestamp;
  /** Values for the new status message. Replaces the previous values. */
  messageValues?: MessageValues;
}

export type ChangeResult<E> =
  { ok: true; entity: E; audit: AuditEntry } | { ok: false; error: string };

interface AuditInput {
  caseId: string;
  actor: Actor;
  action: string;
  reason: string;
  timestamp: IsoTimestamp;
  from?: string;
  to?: string;
}

export function createAuditEntry(input: AuditInput): AuditEntry {
  const { caseId, timestamp, action } = input;
  return { id: `${caseId}|${timestamp}|${action}`, ...input };
}

export function allowedNextStatuses(entity: ChallengeCase): readonly ChallengeStatus[];
export function allowedNextStatuses(entity: RefundCase): readonly RefundStatus[];
export function allowedNextStatuses(entity: CaseEntity): readonly string[];
export function allowedNextStatuses(entity: CaseEntity): readonly string[] {
  return entity.kind === "challenge"
    ? CHALLENGE_TRANSITIONS[entity.status]
    : REFUND_TRANSITIONS[entity.status];
}

function isChallengeStatus(status: string): status is ChallengeStatus {
  return status in CHALLENGE_TRANSITIONS;
}

function isRefundStatus(status: string): status is RefundStatus {
  return status in REFUND_TRANSITIONS;
}

function rejected(entity: CaseEntity, to: string): { ok: false; error: string } {
  return { ok: false, error: `${entity.id} cannot move from "${entity.status}" to "${to}".` };
}

function transition<S extends string, E extends CaseEntity & { status: S }>(
  entity: E,
  to: S,
  allowed: readonly S[],
  actor: Actor,
  reason: string,
  options: ChangeOptions,
): ChangeResult<E> {
  if (!allowed.includes(to)) return rejected(entity, to);
  if (!reason.trim()) {
    return { ok: false, error: "A reason is required for every status change." };
  }
  const updated: E = { ...entity, status: to, messageValues: options.messageValues ?? {} };
  const audit = createAuditEntry({
    caseId: entity.id,
    actor,
    action: "Status changed",
    from: entity.status,
    to,
    reason,
    timestamp: options.timestamp,
  });
  return { ok: true, entity: updated, audit };
}

/**
 * The only way to change a case status. Rejects transitions that are not in the tables above
 * and returns the audit entry that records the change.
 */
export function changeStatus(
  entity: ChallengeCase,
  to: ChallengeStatus,
  actor: Actor,
  reason: string,
  options: ChangeOptions,
): ChangeResult<ChallengeCase>;
export function changeStatus(
  entity: RefundCase,
  to: RefundStatus,
  actor: Actor,
  reason: string,
  options: ChangeOptions,
): ChangeResult<RefundCase>;
export function changeStatus(
  entity: CaseEntity,
  to: ChallengeStatus | RefundStatus,
  actor: Actor,
  reason: string,
  options: ChangeOptions,
): ChangeResult<CaseEntity> {
  if (entity.kind === "challenge") {
    if (!isChallengeStatus(to)) return rejected(entity, to);
    return transition(entity, to, CHALLENGE_TRANSITIONS[entity.status], actor, reason, options);
  }
  if (!isRefundStatus(to)) return rejected(entity, to);
  return transition(entity, to, REFUND_TRANSITIONS[entity.status], actor, reason, options);
}
