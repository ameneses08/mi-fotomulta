import { StatusBadge } from "@/components/StatusBadge";
import { LegalClockBar } from "@/components/LegalClockBar";
import type { LegalClock } from "@/lib/sla";
import type { Tone } from "@/types";

interface CaseHeaderProps {
  title: string;
  subtitle: string;
  status: string;
  tone: Tone;
  clock?: LegalClock;
}

export function CaseHeader({ title, subtitle, status, tone, clock }: CaseHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      <div className="flex items-center gap-5">
        {clock && <LegalClockBar clock={clock} />}
        <StatusBadge text={status} tone={tone} />
      </div>
    </div>
  );
}
