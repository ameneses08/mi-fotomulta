import { useMemo } from "react";
import { DEMO_TODAY } from "@/data/mockData";
import { buildChallengeRows, buildGroups, summariseQueue } from "@/lib/queue";
import { useRulesContext } from "@/store/selectors";

export function useQueue() {
  const ctx = useRulesContext();
  return useMemo(() => {
    const rows = buildChallengeRows(ctx, DEMO_TODAY);
    return { rows, groups: buildGroups(ctx.challenges), summary: summariseQueue(rows, ctx) };
  }, [ctx]);
}
