import { formatDate } from "@/lib/format";
import { isCameraAuthorisedOn } from "@/lib/rules";
import type { Camera, Fine, IsoDate } from "@/types";

export type CameraStatus = "Authorised" | "Expired" | "Unauthorised";

/** Status of the ANSV authorisation on a given date. */
export function cameraStatus(camera: Camera, onDate: IsoDate): CameraStatus {
  if (!camera.authorisedFrom) return "Unauthorised";
  if (camera.authorisedUntil && onDate > camera.authorisedUntil) return "Expired";
  return onDate < camera.authorisedFrom ? "Unauthorised" : "Authorised";
}

export function authorisationRange(camera: Camera): string {
  if (!camera.authorisedFrom) return "No ANSV authorisation on record";
  const until = camera.authorisedUntil ? formatDate(camera.authorisedUntil) : "no end date";
  return `${formatDate(camera.authorisedFrom)} – ${until}`;
}

/** Fines a camera recorded while it was not authorised. */
export function affectedFines(camera: Camera, fines: readonly Fine[]): Fine[] {
  return fines.filter(
    (f) => f.cameraId === camera.id && !isCameraAuthorisedOn(camera, f.infractionDate),
  );
}
