import { Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { AI_LABELS, assistantScripts } from "@/data/aiScripts";
import { fillTemplate } from "@/lib/format";
import { useAppStore } from "@/store/appStore";
import { AssistantChips } from "./AssistantChips";
import { AssistantMessageView } from "./AssistantMessageView";

/** Chat-style assistant. Every answer is a template filled from live state (simulated AI). */
export function AssistantPanel() {
  const firstName = useAppStore((s) => s.citizen.firstName);
  const messages = useAppStore((s) => s.assistantMessages);
  const typing = useAppStore((s) => s.assistantTyping);
  const ask = useAppStore((s) => s.askAssistant);
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  // Keep the newest message visible by scrolling the log only, never the page.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages.length, typing]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(draft);
    setDraft("");
  };

  return (
    <section className="assistant" aria-label="AI assistant">
      <p className="ai-label">
        <Sparkles size={15} aria-hidden="true" />
        {AI_LABELS.assistant}
      </p>
      <div className="assistant-log" ref={logRef}>
        <ol aria-live="polite" className="grid gap-3">
          <li className="bubble bubble-assistant">
            <p>{fillTemplate(assistantScripts.greeting, { first_name: firstName })}</p>
            <AssistantChips />
          </li>
          {messages.map((message) => (
            <AssistantMessageView key={message.id} message={message} />
          ))}
          {typing && (
            <li className="bubble bubble-assistant" aria-label="Assistant is typing">
              <span className="typing" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </li>
          )}
        </ol>
      </div>
      <form className="mt-3 flex gap-2" onSubmit={submit}>
        <label htmlFor="assistant-input" className="sr-only">
          Ask a question
        </label>
        <input
          id="assistant-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about your fines"
          autoComplete="off"
        />
        <Button
          type="submit"
          size="icon"
          className="h-11 w-11 shrink-0"
          disabled={typing || !draft.trim()}
        >
          <Send size={17} aria-hidden="true" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </section>
  );
}
