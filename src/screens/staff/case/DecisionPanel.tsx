import { CheckCircle2, Gavel, Sparkles } from "lucide-react";
import { useState } from "react";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { caseBriefFor, draftCitizenMessage } from "@/lib/brief";
import { availableDecisions } from "@/lib/decision";
import { useAppStore } from "@/store/appStore";
import type { ChallengeCase, DecisionKind } from "@/types";

export function DecisionPanel({ challenge }: { challenge: ChallengeCase }) {
  const decide = useAppStore((s) => s.decideChallenge);
  const brief = caseBriefFor(challenge);
  const options = availableDecisions(challenge.status);
  const initialKind = options.includes(brief.suggestion) ? brief.suggestion : options[0];
  const [kind, setKind] = useState<DecisionKind | undefined>(initialKind);
  const [message, setMessage] = useState(
    initialKind ? draftCitizenMessage(initialKind, challenge) : "",
  );
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!kind) {
    return (
      <section className="staff-column decision-panel" aria-labelledby="decision-title">
        <h2 id="decision-title" className="column-title">
          Decision
        </h2>
        {challenge.status === "Received" ? (
          <Notice>Automatic checks are still running. You can decide once they finish.</Notice>
        ) : (
          <Notice icon={CheckCircle2} variant="success" role="status">
            Decision recorded: {challenge.status}
            {challenge.outcome ? ` – ${challenge.outcome}` : ""}. The citizen has been notified.
          </Notice>
        )}
      </section>
    );
  }

  const choose = (next: DecisionKind) => {
    setKind(next);
    setMessage(draftCitizenMessage(next, challenge));
    setError("");
  };
  const confirm = () =>
    setError(
      decide(challenge.id, {
        kind,
        reason,
        citizenMessage: message,
        aiSuggestion: brief.suggestion,
      }) ?? "",
    );

  return (
    <section className="staff-column decision-panel" aria-labelledby="decision-title">
      <h2 id="decision-title" className="column-title">
        Decision
      </h2>
      <fieldset>
        <legend className="text-sm font-semibold">Outcome</legend>
        {options.map((option) => (
          <label key={option} className="choice compact">
            <input
              type="radio"
              name="decision"
              checked={kind === option}
              onChange={() => choose(option)}
            />
            <span className="flex-1">{option}</span>
            {option === brief.suggestion && <span className="ai-chip">AI suggestion</span>}
          </label>
        ))}
      </fieldset>
      <label className="form-field">
        Message to the citizen{" "}
        <span className="text-xs font-normal text-muted-foreground">(AI draft, editable)</span>
        <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      <label className="form-field">
        Reason for your decision <span className="text-xs font-normal text-danger">(required)</span>
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-required="true"
        />
      </label>
      <Button
        variant="ghost"
        size="sm"
        className="mt-1 px-1"
        onClick={() => setReason(brief.suggestedReason)}
      >
        <Sparkles size={15} aria-hidden="true" />
        Use the AI's suggested reason
      </Button>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      <Button className="mt-4 w-full" onClick={confirm}>
        <Gavel size={18} aria-hidden="true" />
        Confirm decision
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">
        You decide. The AI suggestion is not a legal finding.
      </p>
    </section>
  );
}
