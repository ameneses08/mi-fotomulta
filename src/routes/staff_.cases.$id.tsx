import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { CaseDetailScreen } from "@/screens/staff/case/CaseDetailScreen";

export const Route = createFileRoute("/staff_/cases/$id")({
  component: StaffCasePage,
  head: () =>
    pageHead(
      "Case detail",
      "Claim, AI brief, rule checks and the inspector decision on one screen.",
    ),
});

function StaffCasePage() {
  const { id } = Route.useParams();
  return <CaseDetailScreen id={id} />;
}
