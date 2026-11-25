import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Notice } from "@/components/Notice";
import { caseBriefFor } from "@/lib/brief";
import { availableDecisions } from "@/lib/decision";
import { useAppStore } from "@/store/appStore";
import type { ChallengeCase, DecisionKind } from "@/types";
import { DecisionForm } from "./DecisionForm";
import { SuggestionCard, type DecisionMode } from "./SuggestionCard";

const FINAL: DecisionKind[] = ["Revoke", "Uphold", "Partly uphold"];

export function DecisionPanel({ challenge }: { challenge: ChallengeCase }) {
  const decide = useAppStore((s) => s.decideChallenge);
  const brief = caseBriefFor(challenge);
  const options = availableDecisions(challenge.status);
  const overrideOptions = FINAL.filter((k) => k !== brief.suggestion && options.includes(k));
  const [mode, setMode] = useState<DecisionMode | null>(null);
  const [kind, setKind] = useState<DecisionKind>(brief.suggestion);
  const [error, setError] = useState("");

  const choose = (next: DecisionMode) => {
    setMode(next);
    setError("");
    if (next === "approve") setKind(brief.suggestion);
    else if (next === "override") setKind(overrideOptions[0] ?? brief.suggestion);
    else setKind(next);
  };

  let body;
  if (options.length === 0) {
    body =
      challenge.status === "Received" ? (
        <Notice>Automatic checks are still running. You can act once they finish.</Notice>
      ) : (
        <Notice icon={CheckCircle2} variant="success" role="status">
          Decision recorded: {challenge.status}
          {challenge.outcome ? ` – ${challenge.outcome}` : ""}. The citizen has been notified.
        </Notice>
      );
  } else if (!mode) {
    body = (
      <SuggestionCard
        brief={brief}
        options={options}
        canOverride={overrideOptions.length > 0}
        onChoose={choose}
      />
    );
  } else {
    body = (
      <DecisionForm
        key={mode}
        challenge={challenge}
        mode={mode}
        kind={kind}
        overrideOptions={overrideOptions}
        initialReason={mode === "approve" ? brief.suggestedReason : ""}
        error={error}
        onKindChange={setKind}
        onCancel={() => setMode(null)}
        onSubmit={(reason, citizenMessage) =>
          setError(
            decide(challenge.id, {
              kind,
              reason,
              citizenMessage,
              aiSuggestion: brief.suggestion,
            }) ?? "",
          )
        }
      />
    );
  }

  return (
    <section className="staff-column decision-panel" aria-labelledby="decision-title">
      <h2 id="decision-title" className="column-title">
        Decision
      </h2>
      {body}
    </section>
  );
}
