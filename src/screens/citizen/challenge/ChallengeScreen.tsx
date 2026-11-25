import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { useEffect } from "react";
import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/format";
import { useAppStore } from "@/store/appStore";
import { useFine, useFineStatus } from "@/store/selectors";
import { NotFoundScreen } from "../NotFoundScreen";
import { EvidenceStep } from "./EvidenceStep";
import { FactsStep } from "./FactsStep";
import { ReasonStep } from "./ReasonStep";
import { ReviewStep } from "./ReviewStep";
import { Stepper } from "./Stepper";

const STEPS = [ReasonStep, FactsStep, EvidenceStep, ReviewStep];

export function ChallengeScreen({ id }: { id: string }) {
  const navigate = useNavigate();
  const fine = useFine(id);
  const status = useFineStatus(id);
  const step = useAppStore((s) => s.draft.step);
  const error = useAppStore((s) => s.draftError);
  const { startChallenge, nextStep, previousStep, submitChallenge } = useAppStore.getState();

  useEffect(() => startChallenge(id), [id, startChallenge]);

  if (!fine) return <NotFoundScreen label="Fine" />;
  if (fine.paidOn || status === "Another authority" || status === "Revoked") {
    return (
      <CitizenLayout>
        <h1 className="page-title">Challenge not available</h1>
        <p className="page-subtitle">
          This fine is paid, revoked or issued by another authority, so it cannot be challenged
          here.
        </p>
      </CitizenLayout>
    );
  }

  const Step = STEPS[step] ?? ReasonStep;
  const submit = () => {
    const caseId = submitChallenge();
    if (caseId) void navigate({ to: "/citizen/cases/$id", params: { id: caseId } });
  };

  return (
    <CitizenLayout>
      <h1 className="page-title">Challenge this fine</h1>
      <p className="page-subtitle">
        {fine.id} · {formatCOP(fine.amount)}
      </p>
      <Stepper current={step} />
      <Step />
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      <div className="actions-stack">
        {step < STEPS.length - 1 ? (
          <Button onClick={nextStep}>
            Continue
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        ) : (
          <Button onClick={submit}>
            <Send size={18} aria-hidden="true" />
            Submit challenge
          </Button>
        )}
        {step > 0 && (
          <Button variant="outline" onClick={previousStep}>
            <ArrowLeft size={18} aria-hidden="true" />
            Previous step
          </Button>
        )}
      </div>
    </CitizenLayout>
  );
}
