import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { RefundQueueScreen } from "@/screens/staff/refunds/RefundQueueScreen";

export const Route = createFileRoute("/staff_/refunds")({
  component: RefundQueueScreen,
  head: () =>
    pageHead("Refund queue", "Auto-approved samples, refunds held for review and fraud flags."),
});
