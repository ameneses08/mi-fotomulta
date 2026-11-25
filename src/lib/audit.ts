import type { AuditEntry } from "@/types";

export type ActorType = "System" | "AI assistant" | "Inspector" | "Citizen";

export const ACTOR_TYPES: ActorType[] = ["System", "AI assistant", "Inspector", "Citizen"];

export interface AuditFilters {
  caseId: string;
  actorType: ActorType | "All";
  action: string;
  date: string;
}

export const NO_AUDIT_FILTERS: AuditFilters = {
  caseId: "",
  actorType: "All",
  action: "All",
  date: "All",
};

/** Staff names are passed in so the rule stays pure and data stays in src/data. */
export function actorTypeOf(entry: AuditEntry, staff: readonly string[]): ActorType {
  if (entry.actor === "System") return "System";
  if (entry.actor === "AI assistant") return "AI assistant";
  return staff.includes(entry.actor) ? "Inspector" : "Citizen";
}

const day = (entry: AuditEntry) => entry.timestamp.slice(0, 10);

export function auditOptions(entries: readonly AuditEntry[]): {
  actions: string[];
  dates: string[];
} {
  return {
    actions: [...new Set(entries.map((e) => e.action))].sort(),
    dates: [...new Set(entries.map(day))].sort().reverse(),
  };
}

/** Newest first. Read-only: filtering never changes the log. */
export function filterAudit(
  entries: readonly AuditEntry[],
  filters: AuditFilters,
  staff: readonly string[],
): AuditEntry[] {
  const caseQuery = filters.caseId.trim().toUpperCase();
  return entries
    .filter(
      (e) =>
        (!caseQuery || e.caseId.toUpperCase().includes(caseQuery)) &&
        (filters.actorType === "All" || actorTypeOf(e, staff) === filters.actorType) &&
        (filters.action === "All" || e.action === filters.action) &&
        (filters.date === "All" || day(e) === filters.date),
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
