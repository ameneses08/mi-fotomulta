import { assistantScripts } from "@/data/aiScripts";
import { useAppStore } from "@/store/appStore";

export function AssistantChips() {
  const ask = useAppStore((s) => s.askAssistant);
  const typing = useAppStore((s) => s.assistantTyping);
  return (
    <ul className="mt-3 flex flex-wrap gap-2" aria-label="Suggested questions">
      {assistantScripts.chips.map((chip) => (
        <li key={chip.intent}>
          <button
            type="button"
            className="chip"
            disabled={typing}
            onClick={() => ask(chip.question)}
          >
            {chip.question}
          </button>
        </li>
      ))}
    </ul>
  );
}
