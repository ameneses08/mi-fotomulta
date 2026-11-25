import type { ChallengeCase, ClockRisk, IsoDate } from "@/types";

/**
 * Every timing assumption in one place. Days are working days (Monday–Friday).
 * Colombian public holidays are not modelled yet – see CLAUDE.md.
 */
export const SLA_CONFIG = {
  /** R1: a challenge must be filed within 11 working days of notification. */
  challengeWindowDays: 11,
  /** R5: notification must be sent within 3 working days of the infraction. */
  notificationWindowDays: 3,
  validationDays: 2,
  decisionDays: 10,
  refundPaymentDays: 5,
  appealDays: 10,
  correctionDays: 5,
  hearingNoticeDays: 5,
  /** Share of the legal clock after which a case counts as "At risk". */
  atRiskRatio: 0.7,
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcDate(iso: IsoDate): Date {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`);
}

function toIsoDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

export function isWorkingDay(iso: IsoDate): boolean {
  const weekday = toUtcDate(iso).getUTCDay();
  return weekday !== 0 && weekday !== 6;
}

/** Moves forward `days` working days. The start day itself is not counted. */
export function addWorkingDays(start: IsoDate, days: number): IsoDate {
  let current = toUtcDate(start);
  let remaining = days;
  while (remaining > 0) {
    current = new Date(current.getTime() + DAY_MS);
    if (isWorkingDay(toIsoDate(current))) remaining -= 1;
  }
  return toIsoDate(current);
}

/** Working days after `start` up to and including `end`. Zero when `end` is not after `start`. */
export function workingDaysBetween(start: IsoDate, end: IsoDate): number {
  let current = toUtcDate(start);
  const last = toUtcDate(end);
  let count = 0;
  while (current < last) {
    current = new Date(current.getTime() + DAY_MS);
    if (isWorkingDay(toIsoDate(current))) count += 1;
  }
  return count;
}

export interface LegalClock {
  used: number;
  total: number;
  risk: ClockRisk;
}

export function legalClock(start: IsoDate, today: IsoDate, total: number): LegalClock {
  const used = workingDaysBetween(start, today);
  const risk: ClockRisk =
    used > total ? "Overdue" : used / total >= SLA_CONFIG.atRiskRatio ? "At risk" : "On track";
  return { used, total, risk };
}

/** The decision clock that staff see on every open challenge. */
export function challengeClock(challenge: ChallengeCase, today: IsoDate): LegalClock {
  return legalClock(challenge.submittedOn, today, SLA_CONFIG.decisionDays);
}

/** The date shown to the citizen as "Expected by". Undefined once a decision exists. */
export function expectedDateForChallenge(challenge: ChallengeCase): IsoDate | undefined {
  switch (challenge.status) {
    case "Received":
      return addWorkingDays(challenge.submittedOn, SLA_CONFIG.validationDays);
    case "Validating":
    case "Appealed":
      return addWorkingDays(challenge.submittedOn, SLA_CONFIG.decisionDays);
    case "Needs correction":
    case "Hearing scheduled":
      return challenge.messageValues["dateIso"];
    case "Decided":
    case "Closed":
      return undefined;
  }
}
