import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { RefundScreen } from "@/screens/citizen/RefundScreen";

export const Route = createFileRoute("/citizen_/refunds/$id")({
  component: RefundPage,
  head: () => pageHead("Your refund", "Refund status and a bank account with separate consent."),
});

function RefundPage() {
  const { id } = Route.useParams();
  return <RefundScreen id={id} />;
}
