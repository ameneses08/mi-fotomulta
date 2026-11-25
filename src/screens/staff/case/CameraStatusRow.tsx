import { DataRow } from "@/components/DataRow";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";
import { authorisationRange, cameraStatus, type CameraStatus } from "@/lib/cameras";
import type { Camera, Fine, Tone } from "@/types";

export const CAMERA_STATUS_TONES: Record<CameraStatus, Tone> = {
  Authorised: "success",
  Expired: "warning",
  Unauthorised: "danger",
};

export function CameraStatusRow({ camera, fine }: { camera: Camera | undefined; fine: Fine }) {
  if (!camera) return null;
  const status = cameraStatus(camera, fine.infractionDate);
  return (
    <DataRow
      label={`Camera ${camera.id} on ${formatDate(fine.infractionDate)}`}
      value={
        <span className="grid gap-1">
          <StatusBadge
            text={status}
            tone={CAMERA_STATUS_TONES[status]}
            className="justify-self-start"
          />
          <span className="text-sm font-normal text-muted-foreground">
            Authorisation: {authorisationRange(camera)}
          </span>
        </span>
      }
      source="ANSV"
    />
  );
}
