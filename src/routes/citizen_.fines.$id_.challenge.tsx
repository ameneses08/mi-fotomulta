import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { ChallengeScreen } from "@/screens/citizen/challenge/ChallengeScreen";

export const Route = createFileRoute("/citizen_/fines/$id_/challenge")({
  component: ChallengePage,
  head: () => pageHead("Challenge a fine", "A four-step guided challenge with simulated AI help."),
});

function ChallengePage() {
  const { id } = Route.useParams();
  return <ChallengeScreen id={id} />;
}
