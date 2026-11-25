import { createFileRoute } from "@tanstack/react-router";
import { CaseScreen } from "@/components/prototype/citizen-screens";
import { pageHead } from "@/components/prototype/shared";
export const Route = createFileRoute("/citizen_/cases/$id")({
  component: CasePage,
  head: () =>
    pageHead(
      "Track your challenge",
      "Follow the fictional challenge through five stages, see who holds the case and review its history.",
    ),
});
function CasePage() {
  const { id } = Route.useParams();
  return <CaseScreen id={id} />;
}
