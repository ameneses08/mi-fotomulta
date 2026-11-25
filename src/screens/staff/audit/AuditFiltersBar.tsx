import { ACTOR_TYPES, type AuditFilters } from "@/lib/audit";
import { formatDate } from "@/lib/format";

interface AuditFiltersBarProps {
  value: AuditFilters;
  actions: string[];
  dates: string[];
  onChange: (value: AuditFilters) => void;
}

export function AuditFiltersBar({ value, actions, dates, onChange }: AuditFiltersBarProps) {
  return (
    <div className="filter-bar" role="group" aria-label="Filter the audit log">
      <label className="filter">
        Case or fine
        <input
          value={value.caseId}
          placeholder="e.g. C-1042"
          onChange={(e) => onChange({ ...value, caseId: e.target.value })}
        />
      </label>
      <label className="filter">
        Actor
        <select
          value={value.actorType}
          onChange={(e) =>
            onChange({
              ...value,
              actorType: ACTOR_TYPES.find((t) => t === e.target.value) ?? "All",
            })
          }
        >
          <option>All</option>
          {ACTOR_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="filter">
        Action
        <select
          value={value.action}
          onChange={(e) => onChange({ ...value, action: e.target.value })}
        >
          <option>All</option>
          {actions.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </label>
      <label className="filter">
        Date
        <select value={value.date} onChange={(e) => onChange({ ...value, date: e.target.value })}>
          <option value="All">All</option>
          {dates.map((d) => (
            <option key={d} value={d}>
              {formatDate(d)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
