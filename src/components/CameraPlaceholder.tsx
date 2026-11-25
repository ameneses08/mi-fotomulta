import { Camera } from "lucide-react";

export function CameraPlaceholder({ cameraId }: { cameraId: string }) {
  return (
    <div className="camera-placeholder" role="img" aria-label="Camera photo placeholder">
      <Camera size={30} strokeWidth={1.4} aria-hidden="true" />
      <span>Camera photo · {cameraId}</span>
      <span className="text-xs">Image not available in this prototype</span>
    </div>
  );
}
