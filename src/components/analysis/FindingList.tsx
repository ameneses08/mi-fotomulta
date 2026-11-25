import { LevelBadge } from "@/components/LevelBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { FINDING_RESULT_TONES } from "@/data/statusMessages";
import type { AnalysisFinding } from "@/types";

/** Flat list of analysis findings: result, check, explanation and A/S/H level. */
export function FindingList({ findings }: { findings: AnalysisFinding[] }) {
  return (
    <ul className="grid gap-3" aria-label="AI analysis findings">
      {findings.map((finding) => (
        <li key={finding.id} className="rule-row">
          <LevelBadge level={finding.level} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {finding.ruleId ? `${finding.ruleId} · ` : ""}
              {finding.check}
            </p>
            <p className="text-sm text-muted-foreground">{finding.why}</p>
          </div>
          <StatusBadge text={finding.result} tone={FINDING_RESULT_TONES[finding.result]} />
        </li>
      ))}
    </ul>
  );
}
