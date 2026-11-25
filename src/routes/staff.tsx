import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { QueueScreen } from "@/screens/staff/queue/QueueScreen";

export const Route = createFileRoute("/staff")({
  component: QueueScreen,
  head: () => pageHead("Case queue", "Inspector queue with legal clocks, rule flags and grouping."),
});
