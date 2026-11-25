import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { BulkRevocationScreen } from "@/screens/staff/bulk/BulkRevocationScreen";

export const Route = createFileRoute("/staff_/bulk-revocation")({
  component: BulkRevocationScreen,
  head: () =>
    pageHead("Bulk revocation", "Register a bulk-revocation act and apply it fine by fine."),
});
