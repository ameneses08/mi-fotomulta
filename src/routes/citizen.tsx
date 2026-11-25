import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { MyFinesScreen } from "@/screens/citizen/MyFinesScreen";

export const Route = createFileRoute("/citizen")({
  component: MyFinesScreen,
  head: () => pageHead("My fines", "Six fictional photo-fines and a potential refund."),
});
