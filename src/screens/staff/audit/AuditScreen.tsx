import { RuleText } from "@/components/RuleCode";
import { Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { STAFF_NAMES } from "@/data/mockData";
import {
  actorTypeOf,
  auditOptions,
  filterAudit,
  NO_AUDIT_FILTERS,
  type AuditFilters,
} from "@/lib/audit";
import { formatTimestamp } from "@/lib/format";
import { useAppStore } from "@/store/appStore";
import { AuditFiltersBar } from "./AuditFiltersBar";

const COLUMNS = ["When", "Case", "Actor", "Action", "Change", "Reason"];

export function AuditScreen() {
  const audit = useAppStore((s) => s.audit);
  const [filters, setFilters] = useState<AuditFilters>(NO_AUDIT_FILTERS);
  const options = useMemo(() => auditOptions(audit), [audit]);
  const entries = useMemo(() => filterAudit(audit, filters, STAFF_NAMES), [audit, filters]);

  return (
    <StaffLayout active="audit">
      <h1 className="page-title">Audit log</h1>
      <p className="page-subtitle flex items-center gap-2">
        <Lock size={15} aria-hidden="true" />
        Read-only. Entries cannot be edited or deleted. {entries.length} of {audit.length} shown.
      </p>
      <AuditFiltersBar
        value={filters}
        actions={options.actions}
        dates={options.dates}
        onChange={setFilters}
      />
      <div className="table-wrap">
        <table className="queue-table">
          <caption className="sr-only">Audit entries, newest first</caption>
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="whitespace-nowrap text-sm">{formatTimestamp(entry.timestamp)}</td>
                <td className="font-medium">{entry.caseId}</td>
                <td>
                  <div>{entry.actor}</div>
                  <div className="text-xs text-muted-foreground">
                    {actorTypeOf(entry, STAFF_NAMES)}
                  </div>
                </td>
                <td>{entry.action}</td>
                <td className="text-sm">
                  {entry.to ? `${entry.from ? `${entry.from} → ` : ""}${entry.to}` : "—"}
                </td>
                <td className="max-w-[360px] text-sm text-muted-foreground">
                  <RuleText text={entry.reason} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StaffLayout>
  );
}
