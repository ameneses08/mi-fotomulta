import { Phone } from "lucide-react";
import { assistantScripts } from "@/data/aiScripts";
import type { AssistantMessage } from "@/store/appStore";
import { cn } from "@/lib/utils";
import { AssistantActionLink } from "./AssistantActionLink";
import { AssistantChips } from "./AssistantChips";

export function AssistantMessageView({ message }: { message: AssistantMessage }) {
  const fromUser = message.role === "user";
  return (
    <li className={cn("bubble", fromUser ? "bubble-user" : "bubble-assistant")}>
      <span className="sr-only">{fromUser ? "You:" : "Assistant:"}</span>
      <p>{message.text}</p>
      {message.action && <AssistantActionLink action={message.action} />}
      {message.humanExit && (
        <p className="human-exit">
          <Phone size={14} aria-hidden="true" />
          {assistantScripts.humanExit}
        </p>
      )}
      {message.showChips && <AssistantChips />}
    </li>
  );
}
