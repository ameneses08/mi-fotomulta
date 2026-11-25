import { AuditLog } from "@/components/AuditLog";
import { Notice } from "@/components/Notice";
import { StageTracker } from "@/components/StageTracker";
import { useCaseAudit, useChallenge } from "@/store/selectors";

/** The citizen's view of one challenge. Used on its own route and in the demo phone frame. */
export function CaseView({ caseId }: { caseId: string }) {
  const challenge = useChallenge(caseId);
  const history = useCaseAudit(caseId);
  if (!challenge) return <p className="text-muted-foreground">Case {caseId} not found.</p>;

  return (
    <>
      <h1 className="page-title">Your challenge</h1>
      <p className="page-subtitle">
        Case {challenge.id} · Fine {challenge.fineId}
      </p>
      <StageTracker challenge={challenge} />
      <h2 className="mt-7 text-lg font-semibold">Case history</h2>
      <AuditLog entries={history} />
      <Notice>Dates are illustrative. No official challenge has been filed.</Notice>
    </>
  );
}
