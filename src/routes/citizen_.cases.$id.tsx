import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { CaseScreen } from "@/screens/citizen/CaseScreen";

export const Route = createFileRoute("/citizen_/cases/$id")({
  component: CasePage,
  head: () =>
    pageHead(
      "Track your challenge",
      "Where your challenge is, who has it and when to expect news.",
    ),
});

function CasePage() {
  const { id } = Route.useParams();
  return <CaseScreen id={id} />;
}
