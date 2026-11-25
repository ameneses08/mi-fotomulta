import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { DemoScreen } from "@/screens/demo/DemoScreen";

export const Route = createFileRoute("/demo")({
  component: DemoScreen,
  head: () => pageHead("Live demo", "Citizen and inspector views of the same case, side by side."),
});
