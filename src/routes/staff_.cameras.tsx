import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { CamerasScreen } from "@/screens/staff/cameras/CamerasScreen";

export const Route = createFileRoute("/staff_/cameras")({
  component: CamerasScreen,
  head: () =>
    pageHead("Camera check", "Camera authorisation status and the fines recorded outside it."),
});
