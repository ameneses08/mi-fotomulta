import { Sparkles } from "lucide-react";
import type { IntakeSummary } from "@/lib/intake";

export function IntakeBanner({ summary }: { summary: IntakeSummary }) {
  return (
    <p className="intake-banner" role="status">
      <Sparkles size={16} aria-hidden="true" />
      <span>
        <strong>AI intake today:</strong> {summary.analysed} filings analysed · {summary.grouped}{" "}
        grouped · {summary.flagged} flagged for review · {summary.ready} ready for inspector
      </span>
    </p>
  );
}
