import { CLOCK_RISK_TONES } from "@/data/statusMessages";
import type { LegalClock } from "@/lib/sla";
import { cn } from "@/lib/utils";

/** "6/10 days" with a progress bar; the risk is also written out, not only coloured. */
export function LegalClockBar({ clock }: { clock: LegalClock }) {
  const percent = Math.min(100, Math.round((clock.used / clock.total) * 100));
  const tone = CLOCK_RISK_TONES[clock.risk];
  return (
    <div className="min-w-[120px]">
      <div className="flex justify-between gap-2 text-sm">
        <span className="font-medium">
          {clock.used}/{clock.total} days
        </span>
        <span className={cn("text-xs", `text-tone-${tone}`)}>{clock.risk}</span>
      </div>
      <div
        className="clock-track"
        role="progressbar"
        aria-label={`Legal clock: ${clock.used} of ${clock.total} working days used, ${clock.risk}`}
        aria-valuenow={clock.used}
        aria-valuemin={0}
        aria-valuemax={clock.total}
      >
        <div className={cn("clock-fill", `bg-tone-${tone}`)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
