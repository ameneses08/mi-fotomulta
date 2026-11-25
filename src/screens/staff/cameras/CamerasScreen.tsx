import { StaffLayout } from "@/components/layout/StaffLayout";
import { LevelBadge } from "@/components/LevelBadge";
import { useRulesContext } from "@/store/selectors";
import { CameraRow } from "./CameraRow";

const COLUMNS = ["Camera", "Location", "Status today", "ANSV authorisation", "Fines outside it"];

export function CamerasScreen() {
  const ctx = useRulesContext();
  return (
    <StaffLayout active="cameras">
      <h1 className="page-title">Camera check</h1>
      <p className="page-subtitle flex flex-wrap items-center gap-2">
        Authorisation status from the ANSV registry, checked automatically <LevelBadge level="A" />
      </p>
      <div className="table-wrap">
        <table className="queue-table">
          <caption className="sr-only">Cameras and their authorisation</caption>
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
              <th scope="col">
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ctx.cameras.map((camera) => (
              <CameraRow key={camera.id} camera={camera} ctx={ctx} />
            ))}
          </tbody>
        </table>
      </div>
    </StaffLayout>
  );
}
