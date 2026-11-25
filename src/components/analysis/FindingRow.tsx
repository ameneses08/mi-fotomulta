import type { ReactNode } from "react";
import { LevelBadge } from "@/components/LevelBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { FINDING_RESULT_TONES } from "@/data/statusMessages";
import type { AnalysisFinding } from "@/types";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface FindingRowProps {
  finding: AnalysisFinding;
  /** Review controls or review status, shown under flags. */
  children?: ReactNode;
}

export function FindingRow({ finding, children }: FindingRowProps) {
  return (
    <li className="finding-row">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <StatusBadge text={finding.result} tone={FINDING_RESULT_TONES[finding.result]} />
        <span className="flex flex-wrap items-center gap-2">
          <ConfidenceBadge confidence={finding.confidence} />
          <LevelBadge level={finding.level} />
          {finding.ruleId && <span className="rule-chip">{finding.ruleId}</span>}
        </span>
      </div>
      <p className="mt-2 text-sm font-medium">{finding.check}</p>
      <p className="text-xs text-muted-foreground">{finding.evidence}</p>
      <details className="mt-1">
        <summary className="why-toggle">Why?</summary>
        <p className="mt-1 text-sm">{finding.why}</p>
      </details>
      {children}
    </li>
  );
}
