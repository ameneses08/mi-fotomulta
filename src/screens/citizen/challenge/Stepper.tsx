import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHALLENGE_STEPS } from "@/lib/challenge";

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="stepper" aria-label={`Step ${current + 1} of ${CHALLENGE_STEPS.length}`}>
      {CHALLENGE_STEPS.map((label, index) => (
        <li
          key={label}
          className={cn(
            "step-item",
            index === current && "step-active",
            index < current && "step-complete",
          )}
          aria-current={index === current ? "step" : undefined}
        >
          <span className="step-number">
            {index < current ? <Check size={15} aria-label="Completed" /> : index + 1}
          </span>
          {label}
        </li>
      ))}
    </ol>
  );
}
