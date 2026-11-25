import { useState } from "react";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { INSPECTOR_NAME } from "@/data/mockData";
import { ALL_FILTERS, filterRows, type InboxFilters as Filters } from "@/lib/queue";
import { InboxFilters } from "./InboxFilters";
import { InboxRow } from "./InboxRow";
import { SummaryCards } from "./SummaryCards";
import { useQueue } from "./useQueue";

const COLUMNS = ["Priority", "Case", "Type", "Status", "Legal clock", "Flags", "Assigned to"];

export function InboxScreen() {
  const { rows, groups, summary } = useQueue();
  const [filters, setFilters] = useState<Filters>(ALL_FILTERS);
  const visible = filterRows(rows, filters, INSPECTOR_NAME);

  return (
    <StaffLayout active="inbox">
      <h1 className="page-title">Inspector inbox</h1>
      <p className="page-subtitle">
        Triaged by priority and deadline. Legal clocks count working days.
      </p>
      <SummaryCards summary={summary} />
      <InboxFilters value={filters} onChange={setFilters} />
      <div className="table-wrap">
        <table className="queue-table">
          <caption className="sr-only">Challenges, {visible.length} shown</caption>
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
              <th scope="col">
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <InboxRow
                key={row.challenge.id}
                row={row}
                group={groups.find((g) => g.id === row.groupId)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {visible.length === 0 && (
        <p className="mt-4 text-muted-foreground">No cases match these filters.</p>
      )}
    </StaffLayout>
  );
}
