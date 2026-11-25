import { useMemo } from "react";
import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { citizenFines, summariseCitizen } from "@/lib/citizenSummary";
import { useAppStore } from "@/store/appStore";
import { useRulesContext } from "@/store/selectors";
import { FineCard } from "./FineCard";
import { CitizenSummaryCards } from "./SummaryCards";

export function MyFinesScreen() {
  const citizen = useAppStore((s) => s.citizen);
  const ctx = useRulesContext();
  const summary = useMemo(() => summariseCitizen(ctx, citizen.document), [ctx, citizen.document]);
  const fines = useMemo(() => citizenFines(ctx, citizen.document), [ctx, citizen.document]);

  return (
    <CitizenLayout>
      <h1 className="page-title">Hello, {citizen.firstName}</h1>
      <p className="page-subtitle">Here is where your photo-fines stand · plate {citizen.plate}</p>
      <CitizenSummaryCards summary={summary} />
      <div className="section-heading">
        <h2>My fines</h2>
        <span className="text-sm text-muted-foreground">{fines.length} records</span>
      </div>
      <ul className="grid gap-4 @2xl:grid-cols-2">
        {fines.map((fine) => (
          <li key={fine.id}>
            <FineCard fine={fine} />
          </li>
        ))}
      </ul>
    </CitizenLayout>
  );
}
