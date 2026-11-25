import { RULE_RESULT_TONES } from "@/data/statusMessages";
import type { RuleCheck } from "@/types";
import { LevelBadge } from "./LevelBadge";
import { StatusBadge } from "./StatusBadge";

export function RuleCheckList({ checks }: { checks: RuleCheck[] }) {
  return (
    <ul className="grid gap-3" aria-label="Rule checks">
      {checks.map((check) => (
        <li key={check.ruleId} className="rule-row">
          <LevelBadge level={check.level} />
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
