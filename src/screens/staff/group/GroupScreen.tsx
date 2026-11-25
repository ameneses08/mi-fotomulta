import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { LegalClockBar } from "@/components/LegalClockBar";
import { Notice } from "@/components/Notice";
import { StatusBadge } from "@/components/StatusBadge";
import { CHALLENGE_STATUS_TONES } from "@/data/statusMessages";
import { groupSimilarity, hasNewEvidence } from "@/lib/analysis/similarity";
import { useQueue } from "../inbox/useQueue";

export function GroupScreen({ id }: { id: string }) {
  const { rows, groups } = useQueue();
  const group = groups.find((g) => g.id === id);
  const members = rows.filter((row) => row.groupId === id);

  return (
    <StaffLayout active="inbox">
      <Link to="/staff" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to inbox
      </Link>
      {!group ? (
        <p className="mt-6 text-muted-foreground">This group has no open cases.</p>
      ) : (
        <>
          <h1 className="page-title">
            {group.cases.length} similar cases – {group.representative}
          </h1>
          <p className="page-subtitle">
            Same representative and argument. Each case is decided separately.
          </p>
          <Notice icon={Info}>Grouping saves reading time, not review.</Notice>
          <div className="table-wrap">
            <table className="queue-table">
              <caption className="sr-only">Cases in this group</caption>
              <thead>
                <tr>
                  {[
                    "Case",
                    "Citizen and fine",
                    "Similarity",
                    "Evidence",
                    "Status",
                    "Legal clock",
                  ].map((c) => (
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
                {members.map(({ challenge, clock }) => (
                  <tr key={challenge.id}>
                    <td className="font-medium">{challenge.id}</td>
                    <td>
                      <div>{challenge.citizenName}</div>
                      <div className="text-sm text-muted-foreground">Fine {challenge.fineId}</div>
                    </td>
                    <td className="font-medium">
                      {groupSimilarity(challenge, group.cases).percent}%
                    </td>
                    <td>
                      {hasNewEvidence(challenge) ? (
                        <StatusBadge text="New evidence" tone="info" />
                      ) : (
                        <span className="text-sm text-muted-foreground">Template only</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge
                        text={challenge.status}
                        tone={CHALLENGE_STATUS_TONES[challenge.status]}
                      />
                    </td>
                    <td>
                      <LegalClockBar clock={clock} />
                    </td>
                    <td>
                      <Link
                        to="/staff/cases/$id"
                        params={{ id: challenge.id }}
                        className="table-link"
                      >
                        Open and decide
                        <ArrowRight size={15} aria-hidden="true" />
                        <span className="sr-only"> case {challenge.id}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </StaffLayout>
  );
}
