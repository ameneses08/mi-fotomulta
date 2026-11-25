import { Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardList, Radio, Smartphone } from "lucide-react";
import { DemoControls } from "@/components/layout/DemoControls";
import { HERO_CASE_ID } from "@/data/mockData";
import { useChallenge } from "@/store/selectors";
import { CaseView } from "../citizen/CaseView";
import { ChallengeDetail } from "../staff/case/ChallengeDetail";

export function DemoScreen() {
  const challenge = useChallenge(HERO_CASE_ID);

  return (
    <main className="demo-main">
      <div className="demo-bar">
        <Link to="/" className="back-link">
          <ArrowLeft size={17} aria-hidden="true" />
          Exit demo
        </Link>
        <p className="flex items-center gap-2 font-semibold">
          <Radio size={17} className="text-primary" aria-hidden="true" />
          Live demo – both sides of the same case
        </p>
        <span className="text-sm text-muted-foreground">Case {HERO_CASE_ID}</span>
      </div>
      <div className="demo-grid">
        <section aria-labelledby="demo-citizen">
          <h2 id="demo-citizen" className="demo-pane-title">
            <Smartphone size={18} aria-hidden="true" />
            Marta – citizen app
          </h2>
          <div className="phone-frame">
            <div className="phone-screen">
              <CaseView caseId={HERO_CASE_ID} />
            </div>
          </div>
        </section>
        <section aria-labelledby="demo-staff">
          <h2 id="demo-staff" className="demo-pane-title">
            <ClipboardList size={18} aria-hidden="true" />
            Inspector Laura Gómez – case {HERO_CASE_ID}
          </h2>
          {challenge ? (
            <ChallengeDetail challenge={challenge} compact />
          ) : (
            <p className="text-muted-foreground">
              Marta has not submitted {HERO_CASE_ID} yet. Submit it from the citizen app, or use
              Demo controls → Reset demo data.
            </p>
          )}
        </section>
      </div>
      <DemoControls />
    </main>
  );
}
