import { AIPanel } from "@/components/AIPanel";
import { AnalysisReport } from "@/components/analysis/AnalysisReport";
import { IntakeProgress } from "@/components/analysis/IntakeProgress";
import { RuleCode } from "@/components/RuleCode";
import { caseBriefFor } from "@/lib/brief";
import { useAnalysis, useIntakeStep } from "@/store/selectors";
import type { ChallengeCase } from "@/types";

export function BriefColumn({ challenge }: { challenge: ChallengeCase }) {
  const brief = caseBriefFor(challenge);
  const analysis = useAnalysis(challenge.id);
  const intakeStep = useIntakeStep(challenge.id);

  return (
    <section className="staff-column" aria-labelledby="brief-title">
      <h2 id="brief-title" className="column-title">
        AI analysis
      </h2>
      {intakeStep === undefined ? (
        <AnalysisReport analysis={analysis} />
      ) : (
        <IntakeProgress completed={intakeStep} />
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        The summary never replaces the original filing. Read both.
      </p>
      <AIPanel title="Suggested outcome" audience="staff">
        <p className="text-sm">
          <span className="font-semibold text-foreground">Suggested outcome: </span>
          {brief.suggestion}
        </p>
        <p className="mt-2 text-sm font-semibold text-foreground">Rules it relied on</p>
        <ul className="mt-1 space-y-1 text-sm">
          {brief.reliedOn.map((ruleId) => (
            <li key={ruleId}>
              <RuleCode ruleId={ruleId} />
            </li>
          ))}
        </ul>
      </AIPanel>
      <p className="mt-3 text-xs text-muted-foreground">
        A = automated · S = AI-supported, human signs off · H = human only. Checks route a case;
        they never close it.
      </p>
    </section>
  );
}
