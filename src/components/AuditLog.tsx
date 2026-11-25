import { formatTimestamp } from "@/lib/format";
import type { AuditEntry } from "@/types";

export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  if (!entries.length) return <p className="text-muted-foreground">No entries yet.</p>;
  return (
    <ol className="timeline" aria-label="Audit log">
      {entries.map((entry) => (
        <li className="timeline-entry" key={entry.id}>
          <div className="font-medium">
            {entry.action}
            {entry.to && (
              <span className="font-normal text-muted-foreground">
                {" "}
                · {entry.from ? `${entry.from} → ` : ""}
                {entry.to}
              </span>
            )}
          </div>
          <time dateTime={entry.timestamp}>
            {formatTimestamp(entry.timestamp)} · {entry.actor}
          </time>
          <p>{entry.reason}</p>
        </li>
      ))}
    </ol>
  );
}
