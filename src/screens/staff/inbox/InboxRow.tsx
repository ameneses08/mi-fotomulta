import { Link } from "@tanstack/react-router";
import { ArrowRight, Layers } from "lucide-react";
import { LegalClockBar } from "@/components/LegalClockBar";
import { StatusBadge } from "@/components/StatusBadge";
import { CHALLENGE_STATUS_TONES } from "@/data/statusMessages";
import type { CaseGroup, ChallengeRow, Priority } from "@/lib/queue";
import type { Tone } from "@/types";
import { AssignSelect } from "./AssignSelect";
import { FlagList } from "./FlagList";

const PRIORITY_TONES: Record<Priority, Tone> = {
  High: "danger",
  Medium: "warning",
  Low: "neutral",
};

export function InboxRow({ row, group }: { row: ChallengeRow; group: CaseGroup | undefined }) {
  const { challenge, clock, flags, open, priority } = row;
  return (
    <tr>
      <td>
        <StatusBadge text={priority} tone={PRIORITY_TONES[priority]} />
      </td>
      <td>
        <div className="font-medium">{challenge.id}</div>
        <div className="text-sm text-muted-foreground">{challenge.citizenName}</div>
      </td>
      <td>
        <div>{challenge.reason}</div>
        {group && (
          <Link to="/staff/groups/$id" params={{ id: group.id }} className="group-chip">
            <Layers size={13} aria-hidden="true" />
            {group.representative.split(" ")[0]} group · {group.cases.length}
          </Link>
        )}
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
        {open ? (
          <AssignSelect challenge={challenge} />
        ) : (
          <span className="text-sm">{challenge.holder}</span>
        )}
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
