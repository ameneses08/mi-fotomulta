import { useMemo } from "react";
import { DEMO_TODAY } from "@/data/mockData";
import { buildChallengeRows, buildRefundRows, summariseQueue } from "@/lib/queue";
import { useRulesContext } from "@/store/selectors";

export function useQueue() {
  const ctx = useRulesContext();
  return useMemo(() => {
    const challengeRows = buildChallengeRows(ctx, DEMO_TODAY);
    const refundRows = buildRefundRows(ctx);
    return { challengeRows, refundRows, summary: summariseQueue(challengeRows, refundRows) };
  }, [ctx]);
}
