import { Sparkles } from "lucide-react";
import type { IntakeSummary } from "@/lib/intake";

export function IntakeBanner({ summary }: { summary: IntakeSummary }) {
  return (
    <p className="intake-banner" role="status">
      <Sparkles size={16} aria-hidden="true" />
      <span>
        <strong>AI intake today:</strong> {summary.analysed} filings analysed · {summary.clear}{" "}
        clear · {summary.flagged} with flags to review · {summary.grouped} in groups
      </span>
    </p>
  );
}
