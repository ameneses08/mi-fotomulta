import { createAuditEntry } from "@/lib/transitions";
import type { AuditEntry, ChallengeCase, IsoTimestamp } from "@/types";

export function inspectorLabel(name: string): string {
  return `Inspector ${name}`;
}

/** Reassigning never changes the status; it is still written to the audit log. */
export function assignCase(
  challenge: ChallengeCase,
  inspector: string,
  assignedBy: string,
  timestamp: IsoTimestamp,
): { challenge: ChallengeCase; audit: AuditEntry } | null {
  const holder = inspectorLabel(inspector);
  if (challenge.holder === holder) return null;
  return {
    challenge: { ...challenge, holder },
    audit: createAuditEntry({
      caseId: challenge.id,
      actor: assignedBy,
      action: "Case assigned",
      reason: `Assigned to ${holder} (was ${challenge.holder})`,
      timestamp,
    }),
  };
}
