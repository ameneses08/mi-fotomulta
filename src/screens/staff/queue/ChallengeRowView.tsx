import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { LegalClockBar } from "@/components/LegalClockBar";
import { StatusBadge } from "@/components/StatusBadge";
import { CHALLENGE_STATUS_TONES } from "@/data/statusMessages";
import type { ChallengeRow } from "@/lib/queue";
import { FlagList } from "./FlagList";

export function ChallengeRowView({ row, nested = false }: { row: ChallengeRow; nested?: boolean }) {
  const { challenge, clock, flags, open } = row;
  return (
    <tr className={nested ? "nested-row" : undefined}>
      <td className="font-medium">{challenge.id}</td>
      <td>
        <div>{challenge.citizenName}</div>
        <div className="text-sm text-muted-foreground">{challenge.reason}</div>
      </td>
      <td>
        <StatusBadge
          text={challenge.outcome ?? challenge.status}
          tone={CHALLENGE_STATUS_TONES[challenge.status]}
        />
      </td>
      <td>
        {open ? (
          <LegalClockBar clock={clock} />
        ) : (
          <span className="text-sm text-muted-foreground">Stopped</span>
        )}
      </td>
      <td>
        <FlagList flags={flags} />
      </td>
      <td>
        <Link to="/staff/cases/$id" params={{ id: challenge.id }} className="table-link">
          Open
          <ArrowRight size={15} aria-hidden="true" />
          <span className="sr-only"> case {challenge.id}</span>
        </Link>
      </td>
    </tr>
  );
}
