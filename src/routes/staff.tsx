import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { InboxScreen } from "@/screens/staff/inbox/InboxScreen";

export const Route = createFileRoute("/staff")({
  component: InboxScreen,
  head: () =>
    pageHead("Inspector inbox", "Inspector queue with legal clocks, rule flags and grouping."),
});
