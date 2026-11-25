import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { GroupScreen } from "@/screens/staff/group/GroupScreen";

export const Route = createFileRoute("/staff_/groups/$id")({
  component: GroupPage,
  head: () =>
    pageHead("Case group", "Similar cases listed one by one; each is decided separately."),
});

function GroupPage() {
  const { id } = Route.useParams();
  return <GroupScreen id={id} />;
}
