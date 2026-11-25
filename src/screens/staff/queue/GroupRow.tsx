import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import { useState } from "react";
import { aiScripts } from "@/data/aiScripts";
import type { RowGroup } from "@/lib/queue";
import { ChallengeRowView } from "./ChallengeRowView";

export function GroupRow({ group }: { group: RowGroup }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = expanded ? ChevronDown : ChevronRight;
  return (
    <>
      <tr className="group-row">
        <td colSpan={6}>
          <button
            type="button"
            className="group-toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            <Icon size={16} aria-hidden="true" />
            <Layers size={16} aria-hidden="true" />
            <span className="font-semibold">
              {group.rows.length} similar cases – {group.representative}
            </span>
          </button>
          <p className="ml-12 text-sm text-muted-foreground">{aiScripts.groupingNote}</p>
        </td>
      </tr>
      {expanded &&
        group.rows.map((row) => <ChallengeRowView key={row.challenge.id} row={row} nested />)}
    </>
  );
}
