import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { OversightScreen } from "@/screens/staff/oversight/OversightScreen";

export const Route = createFileRoute("/staff_/ai-oversight")({
  component: OversightScreen,
  head: () =>
    pageHead(
      "AI oversight",
      "Accepted and overridden AI suggestions, flag reviews and time saved.",
    ),
});
