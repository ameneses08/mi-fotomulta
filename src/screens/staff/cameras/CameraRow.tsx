import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { DEMO_TODAY } from "@/data/mockData";
import { affectedFines, authorisationRange, cameraStatus } from "@/lib/cameras";
import type { RulesContext } from "@/lib/rules";
import type { Camera } from "@/types";
import { CAMERA_STATUS_TONES } from "../case/CameraStatusRow";
import { AffectedFines } from "./AffectedFines";

export function CameraRow({ camera, ctx }: { camera: Camera; ctx: RulesContext }) {
  const [open, setOpen] = useState(false);
  const status = cameraStatus(camera, DEMO_TODAY);
  const fines = affectedFines(camera, ctx.fines);
  const Icon = open ? ChevronDown : ChevronRight;
  return (
    <>
      <tr>
        <td className="font-medium">{camera.id}</td>
        <td>{camera.location}</td>
        <td>
          <StatusBadge text={status} tone={CAMERA_STATUS_TONES[status]} />
        </td>
        <td className="text-sm">{authorisationRange(camera)}</td>
        <td>{fines.length}</td>
        <td>
          <button
            type="button"
            className="table-link"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            disabled={!fines.length}
          >
            <Icon size={15} aria-hidden="true" />
            Open affected fines
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} className="bg-muted">
            <AffectedFines fines={fines} ctx={ctx} />
          </td>
        </tr>
      )}
    </>
  );
}
