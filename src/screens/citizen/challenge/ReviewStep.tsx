import { AIPanel } from "@/components/AIPanel";
import { Notice } from "@/components/Notice";
import { StatusBadge } from "@/components/StatusBadge";
import { useAppStore } from "@/store/appStore";

export function ReviewStep() {
  const draft = useAppStore((s) => s.draft);
  const setRequest = useAppStore((s) => s.setRequest);
  const count = draft.evidence.length;

  return (
    <>
      <h2 className="text-xl font-semibold">Review your request</h2>
      {draft.reason && <StatusBadge className="mt-4" text={draft.reason} tone="info" />}
      <AIPanel title="Your drafted request" audience="citizen">
        <label className="sr-only" htmlFor="request">
          Your drafted request
        </label>
        <textarea
          id="request"
          rows={14}
          value={draft.request}
          onChange={(e) => setRequest(e.target.value)}
        />
        <p className="character-count">
          {draft.request.length} characters · you can edit everything
        </p>
      </AIPanel>
      <Notice>An inspector reviews your request. Submitting it does not cancel the fine.</Notice>
      <p className="mt-4 text-sm text-muted-foreground">
        {count} supporting document{count === 1 ? "" : "s"} attached · simulated submission
      </p>
    </>
  );
}
