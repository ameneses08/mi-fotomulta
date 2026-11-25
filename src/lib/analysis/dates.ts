import { analysisScripts as T } from "@/data/aiScripts";
import { fillTemplate, formatDate } from "@/lib/format";
import { addWorkingDays, SLA_CONFIG, workingDaysBetween } from "@/lib/sla";
import type { AnalysisFinding, ChallengeCase, Fine } from "@/types";
import { makeFinding, type AnalysisContext } from "./finding";

/** R1 (11-working-day filing window) and R5 (3-working-day notification window). */
export function dateFindings(
  challenge: ChallengeCase,
  fine: Fine,
  ctx: AnalysisContext,
): AnalysisFinding[] {
  const deadline = addWorkingDays(fine.notificationDate, SLA_CONFIG.challengeWindowDays);
  const onTime = challenge.submittedOn <= deadline;
  const days = workingDaysBetween(fine.infractionDate, fine.notificationDate);
  const notifiedInTime = days <= SLA_CONFIG.notificationWindowDays;
  const values = {
    notified: formatDate(fine.notificationDate),
    deadline: formatDate(deadline),
    filed: formatDate(challenge.submittedOn),
    days: String(days),
    limit: String(SLA_CONFIG.notificationWindowDays),
  };
  return [
    makeFinding(
      "R1",
      {
        caseId: challenge.id,
        category: "Dates",
        check: T.checks.deadline,
        result: onTime ? "Pass" : "Flag",
        evidence: "From: SIMIT notification date and filing date",
        confidence: "High",
        level: "A",
        ruleId: "R1",
        why: fillTemplate(onTime ? T.why.deadlinePass : T.why.deadlineFlag, values),
      },
      ctx,
    ),
    makeFinding(
      "R5",
      {
        caseId: challenge.id,
        category: "Dates",
        check: T.checks.notification,
        result: notifiedInTime ? "Pass" : "Flag",
        evidence: "From: SIMIT infraction and notification dates",
        confidence: "High",
        level: notifiedInTime ? "A" : "H",
        ruleId: "R5",
        why: fillTemplate(notifiedInTime ? T.why.notificationPass : T.why.notificationFlag, values),
      },
      ctx,
    ),
  ];
}
