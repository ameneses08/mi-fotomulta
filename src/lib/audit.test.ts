import { describe, expect, it } from "vitest";
import { actorTypeOf, auditOptions, filterAudit, NO_AUDIT_FILTERS } from "@/lib/audit";
import { createAuditEntry } from "@/lib/transitions";

const staff = ["Laura Gómez"];
const entry = (caseId: string, actor: string, action: string, timestamp: string) =>
  createAuditEntry({ caseId, actor, action, reason: "", timestamp });
const log = [
  entry("C-1042", "Marta Rodríguez Peña", "Challenge submitted", "2026-11-20T08:30:00Z"),
  entry("C-1042", "System", "Status changed", "2026-11-20T08:31:00Z"),
  entry("C-1042", "AI assistant", "Citizen message drafted", "2026-11-25T10:00:00Z"),
  entry("R-1047", "Laura Gómez", "Status changed", "2026-11-25T11:00:00Z"),
];

describe("audit log", () => {
  it("classifies actors", () => {
    expect(log.map((e) => actorTypeOf(e, staff))).toEqual([
      "Citizen",
      "System",
      "AI assistant",
      "Inspector",
    ]);
  });

  it("filters by case, actor type, action and date, newest first", () => {
    expect(filterAudit(log, { ...NO_AUDIT_FILTERS, caseId: "c-1042" }, staff)).toHaveLength(3);
    expect(
      filterAudit(log, { ...NO_AUDIT_FILTERS, actorType: "Inspector" }, staff)[0]?.caseId,
    ).toBe("R-1047");
    expect(filterAudit(log, { ...NO_AUDIT_FILTERS, action: "Status changed" }, staff)).toHaveLength(
      2,
    );
    expect(filterAudit(log, { ...NO_AUDIT_FILTERS, date: "2026-11-20" }, staff)).toHaveLength(2);
    expect(filterAudit(log, NO_AUDIT_FILTERS, staff)[0]?.timestamp).toBe("2026-11-25T11:00:00Z");
  });

  it("offers distinct actions and dates", () => {
    expect(auditOptions(log).dates).toEqual(["2026-11-25", "2026-11-20"]);
    expect(auditOptions(log).actions).toContain("Citizen message drafted");
  });
});
