import { Sparkles } from "lucide-react";
import { analysisScripts } from "@/data/aiScripts";
import { CATEGORY_ORDER } from "@/lib/analysis";
import type { AnalysisFinding, CaseAnalysis } from "@/types";
import { FindingRow } from "./FindingRow";
import { FindingReviewControls } from "./FindingReviewControls";

interface AnalysisReportProps {
  analysis: CaseAnalysis | undefined;
  /** Compact: only flags are listed, with a count of the checks that passed. */
  compact?: boolean;
}

function byCategory(findings: AnalysisFinding[]) {
  return CATEGORY_ORDER.map((category) => ({
    category,
    findings: findings.filter((f) => f.category === category),
  })).filter((group) => group.findings.length);
}

/** Mock AI analysis, grouped by category. Every flag is reviewed by a named inspector. */
export function AnalysisReport({ analysis, compact = false }: AnalysisReportProps) {
  if (!analysis) return null;
  const shown = compact ? analysis.findings.filter((f) => f.result === "Flag") : analysis.findings;
  const hidden = analysis.findings.length - shown.length;

  return (
    <section
      className={compact ? "analysis compact" : "analysis"}
      aria-label={analysisScripts.label}
    >
      <p className="ai-label">
        <Sparkles size={15} aria-hidden="true" />
        {analysisScripts.label}
      </p>
      <p className="mt-2 text-sm">{analysis.summary}</p>
      {byCategory(shown).map(({ category, findings }) => (
        <div key={category} className="mt-4">
          <h4 className="analysis-category">{category}</h4>
          <ul className="grid gap-2">
            {findings.map((finding) => (
              <FindingRow key={finding.id} finding={finding}>
                {finding.result === "Flag" && <FindingReviewControls finding={finding} />}
              </FindingRow>
            ))}
          </ul>
        </div>
      ))}
      {compact && hidden > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {hidden} other checks passed or are informational.
        </p>
      )}
    </section>
  );
}
