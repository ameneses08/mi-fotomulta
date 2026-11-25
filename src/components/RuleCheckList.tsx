import { RULE_LEVEL_LABELS } from "@/data/ruleCatalogue";
import { RULE_RESULT_TONES } from "@/data/statusMessages";
import type { RuleCheck } from "@/types";
import { StatusBadge } from "./StatusBadge";

export function RuleCheckList({ checks }: { checks: RuleCheck[] }) {
  return (
    <ul className="grid gap-3" aria-label="Rule checks">
      {checks.map((check) => (
        <li key={check.ruleId} className="rule-row">
          <span className="level-badge" title={RULE_LEVEL_LABELS[check.level]}>
            {check.level}
            <span className="sr-only"> – {RULE_LEVEL_LABELS[check.level]}</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {check.ruleId} · {check.title}
            </p>
            <p className="text-sm text-muted-foreground">{check.detail}</p>
          </div>
          <StatusBadge text={check.result} tone={RULE_RESULT_TONES[check.result]} />
        </li>
      ))}
    </ul>
  );
}
