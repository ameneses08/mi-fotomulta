import { createFileRoute } from "@tanstack/react-router";
import { ChallengeScreen } from "@/components/prototype/citizen-screens";
import { pageHead } from "@/components/prototype/shared";
export const Route = createFileRoute("/citizen_/fines/$id_/challenge")({
  component: ChallengePage,
  head: () =>
    pageHead(
      "Challenge a fine",
      "Prepare a fictional photo-fine challenge in four guided steps, with editable simulated AI assistance.",
    ),
});
function ChallengePage() {
  const { id } = Route.useParams();
  return <ChallengeScreen id={id} />;
}
