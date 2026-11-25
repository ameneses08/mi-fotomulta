import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { HomeScreen } from "@/screens/home/HomeScreen";

export const Route = createFileRoute("/")({
  component: HomeScreen,
  head: () =>
    pageHead(
      "Your photo-fines, made clear",
      "Check, challenge and get your money back for Bogotá photo-fines. An academic prototype.",
    ),
});
