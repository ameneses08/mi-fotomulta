import { CheckCircle2, Clock3 } from "lucide-react";
import type { LegalAct } from "@/types";

export function ScenarioBanner({ act }: { act: LegalAct }) {
  const inForce = act.status === "In force";
  const Icon = inForce ? CheckCircle2 : Clock3;
  return (
    <div
      className={inForce ? "scenario-banner scenario-a" : "scenario-banner scenario-b"}
      role="status"
    >
      <Icon size={20} aria-hidden="true" />
      <div>
        <p className="font-semibold">
          {inForce ? "Scenario A – the act is in force" : "Scenario B – no act in force yet"}
        </p>
        <p className="text-sm">
          {inForce
            ? "Fines from the listed cameras are revoked and paid amounts can be refunded."
            : "Fines from the listed cameras stay under review and refunds stay on hold. Rules that depend on this act do not apply."}
        </p>
      </div>
    </div>
  );
}
