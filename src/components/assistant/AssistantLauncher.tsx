import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AssistantPanel } from "./AssistantPanel";

/**
 * Narrow containers: a floating "Ask the assistant" button that opens a bottom sheet. The parent
 * wrapper is sticky inside the scrolling container, so it also stays inside the /demo phone frame.
 */
export function AssistantLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open ? (
        <div className="assistant-sheet" role="dialog" aria-label="AI assistant">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              <X size={16} aria-hidden="true" />
              Close
            </Button>
          </div>
          <AssistantPanel />
        </div>
      ) : (
        <Button className="assistant-fab" onClick={() => setOpen(true)}>
          <MessageCircle size={18} aria-hidden="true" />
          Ask the assistant
        </Button>
      )}
    </>
  );
}
