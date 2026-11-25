import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FACT_QUESTIONS } from "@/data/mockData";
import { MAX_FACT_LENGTH } from "@/lib/challenge";
import { useAppStore } from "@/store/appStore";

export function FactsStep() {
  const facts = useAppStore((s) => s.draft.facts);
  const pastedText = useAppStore((s) => s.draft.pastedText);
  const setFact = useAppStore((s) => s.setFact);
  const setPastedText = useAppStore((s) => s.setPastedText);
  const structureClaim = useAppStore((s) => s.structureClaim);

  return (
    <>
      <h2 className="text-xl font-semibold">Tell us what happened</h2>
      <p className="page-subtitle">Use your own words. Keep it short and factual.</p>
      {FACT_QUESTIONS.map((question, index) => (
        <label className="form-field" key={question}>
          {question}
          <textarea
            rows={3}
            maxLength={MAX_FACT_LENGTH}
            value={facts[index] ?? ""}
            onChange={(e) => setFact(index, e.target.value)}
          />
          <span className="character-count block">
            {facts[index]?.length ?? 0} / {MAX_FACT_LENGTH}
          </span>
        </label>
      ))}
      <div className="mt-7 border-t pt-1">
        <label className="form-field">
          Paste text from your own AI assistant{" "}
          <span className="text-sm font-normal text-muted-foreground">(optional)</span>
          <textarea rows={3} value={pastedText} onChange={(e) => setPastedText(e.target.value)} />
        </label>
        <Button
          className="mt-3 w-full"
          variant="outline"
          disabled={!pastedText.trim()}
          onClick={structureClaim}
        >
          <WandSparkles size={18} aria-hidden="true" />
          Turn into a structured claim
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Simulated AI · fills the three answers above. You can edit everything.
        </p>
      </div>
    </>
  );
}
