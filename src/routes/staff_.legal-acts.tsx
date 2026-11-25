import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { LegalActsScreen } from "@/screens/staff/acts/LegalActsScreen";

export const Route = createFileRoute("/staff_/legal-acts")({
  component: LegalActsScreen,
  head: () => pageHead("Legal acts", "Register a bulk-revocation act and apply it fine by fine."),
});
