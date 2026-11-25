import { CheckCircle2, Circle, Clock3, Info, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/types";

const ICONS: Record<Tone, LucideIcon> = {
  neutral: Circle,
  info: Info,
  success: CheckCircle2,
  warning: Clock3,
  danger: XCircle,
};

interface StatusBadgeProps {
  text: string;
  tone?: Tone;
  className?: string;
}

/** Status is always shown as icon + text + colour, never colour alone. */
export function StatusBadge({ text, tone = "neutral", className }: StatusBadgeProps) {
  const Icon = ICONS[tone];
  return (
    <span className={cn("status-badge", `status-${tone}`, className)}>
      <Icon size={13} aria-hidden="true" />
      {text}
    </span>
  );
}
