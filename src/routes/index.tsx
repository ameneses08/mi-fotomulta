import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { SignInScreen } from "@/screens/signin/SignInScreen";

export const Route = createFileRoute("/")({
  component: SignInScreen,
  head: () =>
    pageHead(
      "Sign in",
      "Check, challenge and get your money back for Bogotá photo-fines. An academic prototype.",
    ),
});
