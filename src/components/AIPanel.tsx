import { Circle, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { AI_LABELS } from "@/data/aiScripts";
import { cn } from "@/lib/utils";

interface AIPanelProps {
  title: string;
  audience: "citizen" | "staff";
  children: ReactNode;
  className?: string;
}

/** Every simulated AI output is wrapped in this panel so it is always labelled. */
export function AIPanel({ title, audience, children, className }: AIPanelProps) {
  return (
    <section className={cn("ai-panel", className)} aria-label={title}>
      <div className="ai-label">
        <Sparkles size={15} aria-hidden="true" />
        <span>{AI_LABELS[audience]}</span>
      </div>
      <h3>{title}</h3>
      {children}
      <span className="simulated-tag">
        <Circle size={7} aria-hidden="true" />
        {AI_LABELS.simulated}
      </span>
    </section>
  );
}
