import { CheckCircle2, Circle, Loader2, Sparkles } from "lucide-react";
import { analysisScripts } from "@/data/aiScripts";
import { INTAKE_STEPS, intakeSteps } from "@/lib/intake";
import { cn } from "@/lib/utils";

/** The intake analysis running step by step on a newly submitted filing. */
export function IntakeProgress({ completed }: { completed: number }) {
  const percent = Math.round((completed / INTAKE_STEPS.length) * 100);
  return (
    <section className="analysis" aria-label="AI intake analysis in progress" aria-live="polite">
      <p className="ai-label">
        <Sparkles size={15} aria-hidden="true" />
        {analysisScripts.label}
      </p>
      <p className="mt-2 text-sm font-medium">Analysing the new filing…</p>
      <div
        className="clock-track mt-2"
        role="progressbar"
        aria-label="Intake analysis progress"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={INTAKE_STEPS.length}
      >
        <div className="clock-fill bg-tone-info transition-all" style={{ width: `${percent}%` }} />
      </div>
      <ol className="mt-3 grid gap-2">
        {intakeSteps(completed).map(({ label, state }) => {
          const Icon = state === "done" ? CheckCircle2 : state === "current" ? Loader2 : Circle;
          return (
            <li key={label} className={cn("intake-step", state)}>
              <Icon
                size={16}
                className={state === "current" ? "animate-spin" : undefined}
                aria-hidden="true"
              />
              {label}
              <span className="sr-only">
                , {state === "done" ? "done" : state === "current" ? "in progress" : "waiting"}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
