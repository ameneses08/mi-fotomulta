import { useMemo } from "react";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { LevelBadge } from "@/components/LevelBadge";
import { formatCOP } from "@/lib/format";
import { buildRefundQueue, type RefundSection } from "@/lib/refundQueue";
import { RULES_CONFIG } from "@/lib/rules";
import { useRulesContext } from "@/store/selectors";
import type { RuleLevel } from "@/types";
import { RefundItem } from "./RefundItem";

const SECTIONS: {
  key: Exclude<RefundSection, "waiting">;
  title: string;
  note: string;
  level: RuleLevel;
}[] = [
  {
    key: "autoApproved",
    title: "Auto-approved (sample for audit)",
    note: "Clean claims below the threshold.",
    level: "A",
  },
  {
    key: "held",
    title: "Held for review",
    note: "Above the threshold or a check needs a person.",
    level: "H",
  },
  {
    key: "fraud",
    title: "Fraud flags",
    note: "A flag never rejects by itself; a person resolves it.",
    level: "H",
  },
];

export function RefundQueueScreen() {
  const ctx = useRulesContext();
  const queue = useMemo(() => buildRefundQueue(ctx), [ctx]);

  return (
    <StaffLayout active="refunds">
      <h1 className="page-title">Refund queue</h1>
      <p className="page-subtitle">
        Human review above {formatCOP(RULES_CONFIG.refundHumanThreshold)} or when flagged ·{" "}
        {queue.waiting.length} refunds still waiting for a legal act or bank details.
      </p>
      {SECTIONS.map(({ key, title, note, level }) => (
        <section key={key} className="mt-8" aria-labelledby={`section-${key}`}>
          <h2
            id={`section-${key}`}
            className="flex flex-wrap items-center gap-3 text-lg font-semibold"
          >
            {title} · {queue[key].length} <LevelBadge level={level} withLabel />
          </h2>
          <p className="text-sm text-muted-foreground">{note}</p>
          {queue[key].length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nothing here.</p>
          ) : (
            <ul className="mt-3 grid gap-4 lg:grid-cols-2">
              {queue[key].map((item) => (
                <RefundItem key={item.refund.id} item={item} />
              ))}
            </ul>
          )}
        </section>
      ))}
    </StaffLayout>
  );
}
