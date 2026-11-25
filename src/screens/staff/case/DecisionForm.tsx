import { Gavel, RefreshCw } from "lucide-react";
import { useState } from "react";
import { LevelBadge } from "@/components/LevelBadge";
import { Button } from "@/components/ui/button";
import { INSPECTOR_NAME } from "@/data/mockData";
import { draftCitizenMessage } from "@/lib/brief";
import type { ChallengeCase, DecisionKind } from "@/types";
import type { DecisionMode } from "./SuggestionCard";

const REASON_LABELS: Record<DecisionMode, string> = {
  approve: "Reason (from the AI suggestion – edit if needed)",
  override: "Why you are overriding the suggestion",
  "Request correction": "What the citizen must send",
  "Schedule hearing": "Why a hearing is needed",
};

interface DecisionFormProps {
  challenge: ChallengeCase;
  mode: DecisionMode;
  kind: DecisionKind;
  overrideOptions: DecisionKind[];
  initialReason: string;
  error: string;
  onKindChange: (kind: DecisionKind) => void;
  onSubmit: (reason: string, message: string) => void;
  onCancel: () => void;
}

export function DecisionForm(props: DecisionFormProps) {
  const { challenge, mode, kind, overrideOptions, error } = props;
  const [reason, setReason] = useState(props.initialReason);
  const [message, setMessage] = useState<string | null>(null);
  const draft = draftCitizenMessage(kind, challenge, reason);

  return (
    <form
      className="grid gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit(reason, message ?? draft);
      }}
    >
      {mode === "override" && (
        <fieldset>
          <legend className="text-sm font-semibold">Your outcome</legend>
          {overrideOptions.map((option) => (
            <label key={option} className="choice compact">
              <input
                type="radio"
                name="override"
                checked={kind === option}
                onChange={() => props.onKindChange(option)}
              />
              {option}
            </label>
          ))}
        </fieldset>
      )}
      <label className="form-field">
        {REASON_LABELS[mode]} <span className="text-xs font-normal text-danger">(required)</span>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-required="true"
        />
      </label>
      <label className="form-field">
        <span className="flex items-center justify-between gap-2">
          Message to the citizen
          <LevelBadge level="S" withLabel />
        </span>
        <textarea rows={5} value={message ?? draft} onChange={(e) => setMessage(e.target.value)} />
      </label>
      {message !== null && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="justify-self-start"
          onClick={() => setMessage(null)}
        >
          <RefreshCw size={14} aria-hidden="true" />
          Redraft from my reason
        </Button>
      )}
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="mt-3">
        <Gavel size={17} aria-hidden="true" />
        Approve message and send decision
      </Button>
      <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        <LevelBadge level="H" /> Final decision by Inspector {INSPECTOR_NAME}
      </p>
      <Button type="button" variant="ghost" onClick={props.onCancel}>
        Back
      </Button>
    </form>
  );
}
