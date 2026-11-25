import { CalendarClock, Check, FilePen, Pencil } from "lucide-react";
import { LevelBadge } from "@/components/LevelBadge";
import { Button } from "@/components/ui/button";
import type { CaseBrief } from "@/data/aiScripts";
import type { DecisionKind } from "@/types";

export type DecisionMode = "approve" | "override" | "Request correction" | "Schedule hearing";

interface SuggestionCardProps {
  brief: CaseBrief;
  options: DecisionKind[];
  canOverride: boolean;
  onChoose: (mode: DecisionMode) => void;
}

export function SuggestionCard({ brief, options, canOverride, onChoose }: SuggestionCardProps) {
  return (
    <div className="grid gap-3">
      <div className="suggestion">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">AI suggested outcome</span>
          <LevelBadge level="S" />
        </div>
        <p className="mt-1 text-lg font-semibold">{brief.suggestion}</p>
        <p className="mt-1 text-sm text-muted-foreground">{brief.suggestedReason}</p>
      </div>
      {options.includes(brief.suggestion) && (
        <Button onClick={() => onChoose("approve")}>
          <Check size={17} aria-hidden="true" />
          Approve suggestion
        </Button>
      )}
      {canOverride && (
        <Button variant="outline" onClick={() => onChoose("override")}>
          <Pencil size={17} aria-hidden="true" />
          Override
        </Button>
      )}
      <div className="grid grid-cols-2 gap-2">
        {options.includes("Request correction") && (
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={() => onChoose("Request correction")}
          >
            <FilePen size={15} aria-hidden="true" />
            Request correction
          </Button>
        )}
        {options.includes("Schedule hearing") && (
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={() => onChoose("Schedule hearing")}
          >
            <CalendarClock size={15} aria-hidden="true" />
            Schedule hearing
          </Button>
        )}
      </div>
    </div>
  );
}
