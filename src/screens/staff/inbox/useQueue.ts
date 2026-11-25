import { useMemo } from "react";
import { buildChallengeRows, buildGroups, summariseQueue } from "@/lib/queue";
import { summariseIntake } from "@/lib/intake";
import { useAppStore } from "@/store/appStore";
import { useAnalysisContext } from "@/store/selectors";

export function useQueue() {
  const ctx = useAnalysisContext();
  const progress = useAppStore((s) => s.intakeProgress);
  return useMemo(() => {
    const rows = buildChallengeRows(ctx);
    return {
      rows,
      groups: buildGroups(ctx.challenges),
      summary: summariseQueue(rows, ctx),
      intake: summariseIntake(rows, progress),
    };
  }, [ctx, progress]);
}
