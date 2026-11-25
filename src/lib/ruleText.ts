import { RULES } from "@/data/ruleCatalogue";
import type { RuleId } from "@/types";

export type RuleTextPart = string | { ruleId: RuleId };

function isRuleId(code: string): code is RuleId {
  return code in RULES;
}

/** Splits free text into plain strings and rule codes (R1–R12), so codes can be labelled. */
export function splitRuleCodes(text: string): RuleTextPart[] {
  const parts: RuleTextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(/\bR\d{1,2}\b/g)) {
    const code = match[0];
    if (!isRuleId(code)) continue;
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push({ ruleId: code });
    last = match.index + code.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
