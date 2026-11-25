import { AuditLog } from "@/components/AuditLog";
import { Notice } from "@/components/Notice";
import { StageTracker } from "@/components/StageTracker";
import { citizenHistory } from "@/lib/messages";
import { useCaseAudit, useChallenge } from "@/store/selectors";

/** The citizen's view of one challenge. Used on its own route and in the demo phone frame. */
export function CaseView({ caseId }: { caseId: string }) {
  const challenge = useChallenge(caseId);
  const history = citizenHistory(useCaseAudit(caseId));
  if (!challenge) {
    return <p className="text-muted-foreground">No challenge {caseId} has been submitted yet.</p>;
  }

  return (
    <div className="@container">
      <h1 className="page-title">Your challenge</h1>
      <p className="page-subtitle">
        Case {challenge.id} · Fine {challenge.fineId}
      </p>
      <div className="grid items-start gap-x-8 @2xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <StageTracker challenge={challenge} />
        <section aria-labelledby="case-history">
          <h2 id="case-history" className="mt-7 text-lg font-semibold @2xl:mt-6">
            Case history
          </h2>
          <AuditLog entries={history} />
          <Notice>Dates are illustrative. No official challenge has been filed.</Notice>
        </section>
      </div>
    </div>
  );
}
