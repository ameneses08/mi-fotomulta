import { FileText } from "lucide-react";
import { DataRow } from "@/components/DataRow";
import { FACT_QUESTIONS } from "@/data/mockData";
import { formatCOP, formatDate } from "@/lib/format";
import { useAppStore } from "@/store/appStore";
import { useFine } from "@/store/selectors";
import type { ChallengeCase } from "@/types";
import { CameraStatusRow } from "./CameraStatusRow";

export function ClaimColumn({ challenge }: { challenge: ChallengeCase }) {
  const fine = useFine(challenge.fineId);
  const camera = useAppStore((s) => s.cameras.find((c) => c.id === fine?.cameraId));

  return (
    <section className="staff-column" aria-labelledby="claim-title">
      <h2 id="claim-title" className="column-title">
        Original filing
      </h2>
      <p className="text-sm text-muted-foreground">
        {challenge.citizenName} · {challenge.reason} · filed {formatDate(challenge.submittedOn)}
        {challenge.representative && ` · via ${challenge.representative}`}
      </p>
      <div className="original-filing" tabIndex={0} aria-label="Original filing text">
        {challenge.request}
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold">Citizen's answers</summary>
        <dl className="mt-2 grid gap-3">
          {challenge.facts.map((fact, index) => (
            <div key={index}>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                {FACT_QUESTIONS[index] ?? "Statement"}
              </dt>
              <dd className="text-sm">{fact}</dd>
            </div>
          ))}
        </dl>
      </details>
      <h3 className="column-subtitle">Evidence</h3>
      {challenge.evidence.length ? (
        <ul className="grid gap-2">
          {challenge.evidence.map((item) => (
            <li key={item.name} className="flex items-center gap-2 text-sm">
              <FileText size={16} aria-hidden="true" />
              <span className="min-w-0 flex-1 break-words">{item.name}</span>
              <span className="text-muted-foreground">{item.kind}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No documents attached.</p>
      )}
      {fine && (
        <>
          <h3 className="column-subtitle">Fine data</h3>
          <dl>
            <DataRow label="Fine" value={`${fine.id} · ${formatCOP(fine.amount)}`} source="SIMIT" />
            <DataRow
              label="Recorded"
              value={`${formatDate(fine.infractionDate)} · ${fine.location}`}
              source="SIMIT"
            />
            <DataRow label="Notified" value={formatDate(fine.notificationDate)} source="SIMIT" />
            <DataRow
              label="Plate (RUNT / image)"
              value={`${fine.plate} / ${fine.imagePlate}`}
              source="RUNT"
            />
            <CameraStatusRow camera={camera} fine={fine} />
          </dl>
        </>
      )}
    </section>
  );
}
