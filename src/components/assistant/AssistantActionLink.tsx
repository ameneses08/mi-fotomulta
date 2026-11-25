import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { AssistantAction } from "@/lib/assistant";

const CLASS = "table-link";

export function AssistantActionLink({ action }: { action: AssistantAction }) {
  const content = (
    <>
      {action.label}
      <ArrowRight size={15} aria-hidden="true" />
    </>
  );
  switch (action.target) {
    case "fine":
      return (
        <Link to="/citizen/fines/$id" params={{ id: action.id }} className={CLASS}>
          {content}
        </Link>
      );
    case "challenge":
      return (
        <Link to="/citizen/fines/$id/challenge" params={{ id: action.id }} className={CLASS}>
          {content}
        </Link>
      );
    case "case":
      return (
        <Link to="/citizen/cases/$id" params={{ id: action.id }} className={CLASS}>
          {content}
        </Link>
      );
    case "refund":
      return (
        <Link to="/citizen/refunds/$id" params={{ id: action.id }} className={CLASS}>
          {content}
        </Link>
      );
    case "fines":
      return (
        <Link to="/citizen" className={CLASS}>
          {content}
        </Link>
      );
  }
}
