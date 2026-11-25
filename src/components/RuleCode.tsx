import { Fragment } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RULES } from "@/data/ruleCatalogue";
import { splitRuleCodes } from "@/lib/ruleText";
import type { RuleId } from "@/types";

/** A rule code with its plain-language label; the one-sentence rule appears on hover or focus. */
export function RuleCode({ ruleId }: { ruleId: RuleId }) {
  const { label, rule } = RULES[ruleId];
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="rule-chip" tabIndex={0}>
            <span>{ruleId}</span> <span className="font-medium">{label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{rule}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Free text (audit reasons, notes) with every rule code shown as a labelled RuleCode. */
export function RuleText({ text }: { text: string }) {
  return (
    <>
      {splitRuleCodes(text).map((part, index) =>
        typeof part === "string" ? (
          <Fragment key={index}>{part}</Fragment>
        ) : (
          <RuleCode key={index} ruleId={part.ruleId} />
        ),
      )}
    </>
  );
}
