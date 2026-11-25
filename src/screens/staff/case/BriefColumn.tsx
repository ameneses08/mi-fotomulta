import { AIPanel } from "@/components/AIPanel";
import { FindingList } from "@/components/analysis/FindingList";
import { RULES } from "@/data/ruleCatalogue";
import { caseBriefFor } from "@/lib/brief";
import { useAnalysis } from "@/store/selectors";
import type { ChallengeCase } from "@/types";

export function BriefColumn({ challenge }: { challenge: ChallengeCase }) {
  const brief = caseBriefFor(challenge);
  const analysis = useAnalysis(challenge.id);

  return (
    <section className="staff-column" aria-labelledby="brief-title">
      <h2 id="brief-title" className="column-title">
        AI summary
      </h2>
      <AIPanel title="Summary and suggested outcome" audience="staff" className="mt-0">
        <p>{brief.brief}</p>
        <p className="mt-3 text-sm">
          <span className="font-semibold text-foreground">Suggested outcome: </span>
          {brief.suggestion}
        </p>
        <p className="mt-2 text-sm font-semibold text-foreground">Rules it relied on</p>
        <ul className="mt-1 list-disc pl-5 text-sm">
          {brief.reliedOn.map((ruleId) => (
            <li key={ruleId}>
              {ruleId} · {RULES[ruleId].title}
            </li>
          ))}
        </ul>
      </AIPanel>
      <p className="mt-2 text-xs text-muted-foreground">
        The summary never replaces the original filing. Read both.
      </p>
      <h3 className="column-subtitle">Flags and checks</h3>
      <p className="mb-3 text-xs text-muted-foreground">
        A = automated · S = AI-supported, human signs off · H = human only. Checks route a case;
        they never close it.
      </p>
      <FindingList findings={analysis?.findings ?? []} />
    </section>
  );
}
