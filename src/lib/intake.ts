import { analysisScripts } from "@/data/aiScripts";
import type { ChallengeRow } from "@/lib/queue";
import type { StageState } from "@/types";

export const INTAKE_STEPS: readonly string[] = analysisScripts.intakeSteps;

/** Steps completed per case while the intake analysis runs. Missing = already analysed. */
export type IntakeProgress = Readonly<Record<string, number>>;

export function isIntakeComplete(caseId: string, progress: IntakeProgress): boolean {
  const done = progress[caseId];
  return done === undefined || done >= INTAKE_STEPS.length;
}

/** Each step as done / current / upcoming, for the progress list. */
export function intakeSteps(completed: number): { label: string; state: StageState }[] {
  return INTAKE_STEPS.map((label, index) => ({
    label,
    state: index < completed ? "done" : index === completed ? "current" : "upcoming",
  }));
}

/** Non-overlapping counts: clear + flagged = analysed. Grouped is a separate overview count. */
export interface IntakeSummary {
  analysed: number;
  clear: number;
  flagged: number;
  grouped: number;
}

/** "AI intake today": every analysed filing is ready for an inspector; some carry flags. */
export function summariseIntake(
  rows: readonly ChallengeRow[],
  progress: IntakeProgress,
): IntakeSummary {
  const analysed = rows.filter((row) => row.open && isIntakeComplete(row.challenge.id, progress));
  const flagged = analysed.filter((row) => row.flags.length > 0);
  return {
    analysed: analysed.length,
    clear: analysed.length - flagged.length,
    flagged: flagged.length,
    grouped: analysed.filter((row) => row.groupId).length,
  };
}
