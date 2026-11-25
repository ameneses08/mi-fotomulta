import { RULE_LEVEL_LABELS } from "@/data/ruleCatalogue";
import type { RuleLevel } from "@/types";

const DESCRIPTIONS: Record<RuleLevel, string> = {
  A: "Fully automated",
  S: "AI-supported, human signs off",
  H: "Human only",
};

/** P6 automation level: A automated, S AI-supported with sign-off, H human only. */
export function LevelBadge({
  level,
  withLabel = false,
}: {
  level: RuleLevel;
  withLabel?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      title={DESCRIPTIONS[level]}
    >
      <span className="level-badge">{level}</span>
      {withLabel ? (
        DESCRIPTIONS[level]
      ) : (
        <span className="sr-only">{RULE_LEVEL_LABELS[level]}</span>
      )}
    </span>
  );
}
