import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { CHALLENGE_STATUS_TONES } from "@/data/statusMessages";
import { formatDate } from "@/lib/format";
import { useAppStore } from "@/store/appStore";

export function CasesScreen() {
  const document = useAppStore((s) => s.citizen.document);
  const all = useAppStore((s) => s.challenges);
  const cases = useMemo(() => all.filter((c) => c.citizenDocument === document), [all, document]);

  return (
    <CitizenLayout>
      <h1 className="page-title">My cases</h1>
      <p className="page-subtitle">Challenges you have submitted.</p>
      {cases.length === 0 && <p className="mt-6 text-muted-foreground">You have no cases yet.</p>}
      <ul className="mt-6 grid gap-4 @2xl:grid-cols-2">
        {cases.map((c) => (
          <li key={c.id} className="panel">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">
                Case {c.id} · fine {c.fineId}
              </h2>
              <StatusBadge text={c.outcome ?? c.status} tone={CHALLENGE_STATUS_TONES[c.status]} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {c.reason} · submitted {formatDate(c.submittedOn)}
            </p>
            <Link to="/citizen/cases/$id" params={{ id: c.id }} className="table-link">
              Track this case
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </CitizenLayout>
  );
}
