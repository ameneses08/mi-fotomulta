import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { HelpScreen } from "@/screens/citizen/HelpScreen";

export const Route = createFileRoute("/citizen_/help")({
  component: HelpScreen,
  head: () =>
    pageHead("Help", "Talk to a person: Línea 195 or a Centro de Servicios de Movilidad."),
});
