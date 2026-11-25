import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StageState } from "@/types";

export interface ProgressStep {
  label: string;
  state: StageState;
}

const STATE_LABELS: Record<StageState, string> = {
  done: "completed",
  current: "current stage",
  upcoming: "not started",
  skipped: "skipped",
};

/** Horizontal five-stage bar used by the case and refund trackers. */
export function ProgressSteps({ steps, label }: { steps: ProgressStep[]; label: string }) {
  return (
    <ol className="stage-bar" aria-label={label}>
      {steps.map((step) => (
        <li
          key={step.label}
          className={cn("stage-segment", step.state)}
          aria-current={step.state === "current" ? "step" : undefined}
        >
          <span className="flex items-center gap-1">
            {step.state === "done" && <Check size={12} aria-hidden="true" />}
            {step.state === "skipped" && <Minus size={12} aria-hidden="true" />}
            {step.label}
          </span>
          {step.state === "skipped" && <span className="stage-note">Skipped</span>}
          <span className="sr-only">, {STATE_LABELS[step.state]}</span>
        </li>
      ))}
    </ol>
  );
}
