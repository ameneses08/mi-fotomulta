import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { FineDetailScreen } from "@/screens/citizen/FineDetailScreen";

export const Route = createFileRoute("/citizen_/fines/$id")({
  component: FinePage,
  head: () =>
    pageHead(
      "Fine details",
      "Fine data from SIMIT, RUNT and ANSV with a simulated AI explanation.",
    ),
});

function FinePage() {
  const { id } = Route.useParams();
  return <FineDetailScreen id={id} />;
}
