import { Clock3, MessageSquareText, UserRound } from "lucide-react";
import { CHALLENGE_STATUS_TONES } from "@/data/statusMessages";
import { useHighlightOnChange } from "@/hooks/useHighlightOnChange";
import { formatDate } from "@/lib/format";
import { challengeMessage, holderLabel, trackerSteps } from "@/lib/messages";
import { expectedDateForChallenge } from "@/lib/sla";
import { cn } from "@/lib/utils";
import type { ChallengeCase } from "@/types";
import { ProgressSteps } from "./ProgressSteps";
import { StatusBadge } from "./StatusBadge";

/** Delivery-style tracker: where the case is, who has it and when to expect the next step. */
export function StageTracker({ challenge }: { challenge: ChallengeCase }) {
  const highlight = useHighlightOnChange(`${challenge.status}|${challenge.holder}`);
  const steps = trackerSteps(challenge).map((s) => ({ label: s.stage, state: s.state }));
  const expected = expectedDateForChallenge(challenge);
  const statusText = challenge.outcome
    ? `${challenge.status}: ${challenge.outcome}`
    : challenge.status;

  return (
    <div className={cn("tracker", highlight && "tracker-flash")}>
      <ProgressSteps steps={steps} label="Challenge progress" />
      <section className="panel" aria-live="polite">
        <StatusBadge text={statusText} tone={CHALLENGE_STATUS_TONES[challenge.status]} />
        <p className="mt-4 text-lg font-semibold leading-snug">{challengeMessage(challenge)}</p>
        {challenge.citizenNote && (
          <div className="inspector-note">
            <MessageSquareText size={17} aria-hidden="true" />
            <p>{challenge.citizenNote}</p>
          </div>
        )}
        <dl className="mt-5 grid gap-4">
          <div>
            <dt className="text-sm text-muted-foreground">Who has your case now</dt>
            <dd className="flex items-center gap-2 font-medium">
              <UserRound size={16} aria-hidden="true" />
              {holderLabel(challenge)}
            </dd>
          </div>
          {expected && (
            <div>
              <dt className="text-sm text-muted-foreground">Expected by</dt>
              <dd className="flex items-center gap-2 font-medium">
                <Clock3 size={16} aria-hidden="true" />
                {formatDate(expected)}
              </dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}
