import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { CasesScreen } from "@/screens/citizen/CasesScreen";

export const Route = createFileRoute("/citizen_/cases/")({
  component: CasesScreen,
  head: () => pageHead("My cases", "The challenges you have submitted and where they stand."),
});
