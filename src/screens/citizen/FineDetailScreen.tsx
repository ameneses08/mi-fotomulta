import { CheckCircle2 } from "lucide-react";
import { AIPanel } from "@/components/AIPanel";
import { CameraPlaceholder } from "@/components/CameraPlaceholder";
import { DataRow } from "@/components/DataRow";
import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { Notice } from "@/components/Notice";
import { StatusBadge } from "@/components/StatusBadge";
import { aiScripts } from "@/data/aiScripts";
import { AUTHORITY_NAMES } from "@/data/mockData";
import { FINE_STATUS_TONES } from "@/data/statusMessages";
import { formatCOP, formatDate } from "@/lib/format";
import { isCameraAuthorisedOn } from "@/lib/rules";
import { useAppStore } from "@/store/appStore";
import { useFine, useFineStatus } from "@/store/selectors";
import type { FineStatus } from "@/types";
import { FineActions } from "./FineActions";
import { NotFoundScreen } from "./NotFoundScreen";

function explanationFor(status: FineStatus, authorised: boolean): string {
  if (status === "Another authority") return aiScripts.explanation.external;
  if (status === "Revoked") return aiScripts.explanation.revoked;
  return authorised ? aiScripts.explanation.authorised : aiScripts.explanation.unauthorised;
}

export function FineDetailScreen({ id }: { id: string }) {
  const fine = useFine(id);
  const status = useFineStatus(id);
  const camera = useAppStore((s) => s.cameras.find((c) => c.id === fine?.cameraId));
  if (!fine || !status) return <NotFoundScreen label="Fine" />;
  const authorised = isCameraAuthorisedOn(camera, fine.infractionDate);

  return (
    <CitizenLayout back={{ to: "/citizen", label: "My fines" }}>
      <div className="flex items-start justify-between gap-2">
        <h1 className="page-title">Fine details</h1>
        <StatusBadge text={status} tone={FINE_STATUS_TONES[status]} />
      </div>
      <p className="page-subtitle">
        {fine.id} · {fine.plate}
      </p>
      <div className="money-value">{formatCOP(fine.amount)}</div>
      <dl className="detail-rows">
        <DataRow label="Fine reference" value={fine.reference} source="SIMIT" />
        <DataRow label="Date recorded" value={formatDate(fine.infractionDate)} source="SIMIT" />
        <DataRow label="Location" value={fine.location} source="SIMIT" />
        <DataRow label="Recorded violation" value={fine.offence} source="SIMIT" />
        <DataRow label="Vehicle plate" value={fine.plate} source="RUNT" />
        <DataRow label="Registered owner" value={fine.ownerName} source="RUNT" />
        <DataRow
          label="Camera status on that date"
          value={
            <StatusBadge
              text={authorised ? "Authorised" : "Not authorised"}
              tone={authorised ? "success" : "warning"}
            />
          }
          source="ANSV"
        />
        <DataRow
          label="Issuing authority"
          value={AUTHORITY_NAMES[fine.authorityId]}
          source="SIMIT"
        />
      </dl>
      <Notice icon={CheckCircle2}>
        We already have this information. You don't need to send it.
      </Notice>
      <CameraPlaceholder cameraId={fine.cameraId} />
      <AIPanel title="Explain my fine" audience="citizen">
        <p>{explanationFor(status, authorised)}</p>
      </AIPanel>
      <FineActions fine={fine} status={status} />
    </CitizenLayout>
  );
}
