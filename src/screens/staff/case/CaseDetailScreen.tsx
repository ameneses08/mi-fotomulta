import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { DEMO_TODAY } from "@/data/mockData";
import { CHALLENGE_STATUS_TONES, REFUND_STATUS_TONES } from "@/data/statusMessages";
import { challengeClock } from "@/lib/sla";
import { useChallenge, useRefund } from "@/store/selectors";
import { CaseHeader } from "./CaseHeader";
import { ChallengeDetail } from "./ChallengeDetail";
import { RefundDetail } from "./RefundDetail";

export function CaseDetailScreen({ id }: { id: string }) {
  const challenge = useChallenge(id);
  const refund = useRefund(id);

  return (
    <StaffLayout active="inbox">
      <Link to="/staff" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to queue
      </Link>
      {challenge && (
        <>
          <CaseHeader
            title={`Challenge ${challenge.id}`}
            subtitle={`${challenge.citizenName} · fine ${challenge.fineId} · ${challenge.reason}`}
            status={
              challenge.outcome ? `${challenge.status}: ${challenge.outcome}` : challenge.status
            }
            tone={CHALLENGE_STATUS_TONES[challenge.status]}
            clock={challengeClock(challenge, DEMO_TODAY)}
          />
          <ChallengeDetail challenge={challenge} />
        </>
      )}
      {refund && (
        <>
          <CaseHeader
            title={`Refund ${refund.id}`}
            subtitle={`${refund.claimantName} · fine ${refund.fineId}`}
            status={refund.status}
            tone={REFUND_STATUS_TONES[refund.status]}
          />
          <RefundDetail refund={refund} />
        </>
      )}
      {!challenge && !refund && <p className="mt-6 text-muted-foreground">Case {id} not found.</p>}
    </StaffLayout>
  );
}
