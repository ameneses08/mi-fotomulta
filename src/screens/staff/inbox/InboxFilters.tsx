import { CHALLENGE_REASONS } from "@/data/mockData";
import type { InboxFilters as Filters, Priority } from "@/lib/queue";

const PRIORITIES: (Priority | "All")[] = ["All", "High", "Medium", "Low"];

interface InboxFiltersProps {
  value: Filters;
  onChange: (value: Filters) => void;
}

export function InboxFilters({ value, onChange }: InboxFiltersProps) {
  return (
    <div className="filter-bar" role="group" aria-label="Filter cases">
      <label className="filter">
        Priority
        <select
          value={value.priority}
          onChange={(e) =>
            onChange({ ...value, priority: PRIORITIES.find((p) => p === e.target.value) ?? "All" })
          }
        >
          {PRIORITIES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label className="filter">
        Type
        <select
          value={value.type}
          onChange={(e) =>
            onChange({
              ...value,
              type: CHALLENGE_REASONS.find((r) => r === e.target.value) ?? "All",
            })
          }
        >
          <option>All</option>
          {CHALLENGE_REASONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <label className="filter">
        Assigned
        <select
          value={value.assignee}
          onChange={(e) =>
            onChange({ ...value, assignee: e.target.value === "Mine" ? "Mine" : "All" })
          }
        >
          <option value="All">Everyone</option>
          <option value="Mine">Assigned to me</option>
        </select>
      </label>
    </div>
  );
}
