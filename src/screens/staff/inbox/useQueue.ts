import { useMemo } from "react";
import { buildChallengeRows, buildGroups, summariseQueue } from "@/lib/queue";
import { useAnalysisContext } from "@/store/selectors";

export function useQueue() {
  const ctx = useAnalysisContext();
  return useMemo(() => {
    const rows = buildChallengeRows(ctx);
    return { rows, groups: buildGroups(ctx.challenges), summary: summariseQueue(rows, ctx) };
  }, [ctx]);
}
